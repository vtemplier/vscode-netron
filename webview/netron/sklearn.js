
// Experimental

const sklearn = {};

sklearn.ModelFactory = class {

    async match(context) {
        const obj = await context.peek('pkl');
        const validate = (obj, name) => {
            if (obj && obj.__class__ && obj.__class__.__module__ && obj.__class__.__name__) {
                const key = `${obj.__class__.__module__}.${obj.__class__.__name__}`;
                return key.startsWith(name);
            }
            return false;
        };
        const formats = [
            { name: 'sklearn.', format: 'sklearn' },
            { name: 'xgboost.sklearn.', format: 'sklearn' },
            { name: 'lightgbm.sklearn.', format: 'sklearn' },
            { name: 'scipy.', format: 'scipy' },
            { name: 'hmmlearn.', format: 'hmmlearn' }
        ];
        for (const format of formats) {
            if (validate(obj, format.name)) {
                return context.set(format.format, obj);
            }
            if (Array.isArray(obj) && obj.length > 0 && obj.every((item) => validate(item, format.name))) {
                return context.set(`${format.format}.list`, obj);
            }
            if (Object(obj) === obj || obj instanceof Map) {
                const entries = obj instanceof Map ? Array.from(obj) : Object.entries(obj);
                if (entries.length > 0 && entries.every(([, value]) => validate(value, format.name))) {
                    return context.set(`${format.format}.map`, obj);
                }
            }
        }
        return null;
    }

    async open(context) {
        const metadata = await context.metadata('sklearn-metadata.json');
        return new sklearn.Model(metadata, context.type, context.value);
    }
};

sklearn.Model = class {

    constructor(metadata, type, obj) {
        const formats = new Map([
            ['sklearn', 'scikit-learn'],
            ['scipy', 'SciPy'],
            ['hmmlearn', 'hmmlearn']
        ]);
        this.format = formats.get(type.split('.').shift());
        this.graphs = [];
        const version = [];
        switch (type) {
            case 'sklearn':
            case 'scipy':
            case 'hmmlearn': {
                if (obj._sklearn_version) {
                    version.push(` v${obj._sklearn_version}`);
                }
                this.graphs.push(new sklearn.Graph(metadata, '', obj));
                break;
            }
            case 'sklearn.list':
            case 'scipy.list': {
                const list = obj;
                for (let i = 0; i < list.length; i++) {
                    const obj = list[i];
                    this.graphs.push(new sklearn.Graph(metadata, i.toString(), obj));
                    if (obj._sklearn_version) {
                        version.push(` v${obj._sklearn_version}`);
                    }
                }
                break;
            }
            case 'sklearn.map':
            case 'scipy.map': {
                const entries = obj instanceof Map ? Array.from(obj) : Object.entries(obj);
                for (const [name, value] of entries) {
                    this.graphs.push(new sklearn.Graph(metadata, name, value));
                    if (value._sklearn_version) {
                        version.push(` v${value._sklearn_version}`);
                    }
                }
                break;
            }
            default: {
                throw new sklearn.Error(`Unsupported scikit-learn format '${type}'.`);
            }
        }
        if (version.length > 0 && version.every((value) => value === version[0])) {
            this.format += version[0];
        }
    }
};

sklearn.Graph = class {

    constructor(metadata, name, obj) {
        this.name = name || '';
        this.nodes = [];
        this.inputs = [];
        this.outputs = [];
        const node = new sklearn.Node(metadata, '', obj);
        this.nodes.push(node);
    }
};

sklearn.Argument = class {

    constructor(name, value, type, visible) {
        this.name = name;
        this.value = value;
        this.type = type;
        this.visible = visible !== false;
    }
};

sklearn.Value = class {

    constructor(name, type, initializer) {
        if (typeof name !== 'string') {
            throw new sklearn.Error(`Invalid value identifier '${JSON.stringify(name)}'.`);
        }
        this.name = name;
        this.type = initializer ? initializer.type : type;
        this.initializer = initializer || null;
    }
};

sklearn.Node = class {

    constructor(metadata, name, obj, stack) {
        this.name = name || '';
        const type = obj.__class__ ? `${obj.__class__.__module__}.${obj.__class__.__name__}` : 'builtins.dict';
        this.type = metadata.type(type) || { name: type };
        this.inputs = [];
        this.outputs = [];
        const isObject = (obj) => {
            if (obj && typeof obj === 'object') {
                const proto = Object.getPrototypeOf(obj);
                return proto === Object.prototype || proto === null;
            }
            return false;
        };
        if (type === 'builtins.bytearray') {
            const attribute = new sklearn.Argument('value', Array.from(obj), 'byte[]');
            this.inputs.push(attribute);
        } else {
            const entries = Object.entries(obj);
            for (const [name, value] of entries) {
                if (name === '__class__') {
                    continue;
                } else if (value && sklearn.Utility.isTensor(value)) {
                    const tensor = new sklearn.Tensor(value);
                    const argument = new sklearn.Argument(name, tensor, 'tensor');
                    this.inputs.push(argument);
                } else if (Array.isArray(value) && value.length > 0 && value.every((obj) => sklearn.Utility.isTensor(obj))) {
                    const tensors = value.map((obj) => new sklearn.Tensor(obj));
                    const argument = new sklearn.Argument(name, tensors, 'tensor[]');
                    this.inputs.push(argument);
                } else if (sklearn.Utility.isType(value, 'builtins.bytearray')) {
                    const argument = new sklearn.Argument(name, Array.from(value), 'byte[]');
                    this.inputs.push(argument);
                } else {
                    stack = stack || new Set();
                    if (value && Array.isArray(value) && value.every((obj) => typeof obj === 'string')) {
                        const argument = new sklearn.Argument(name, value, 'string[]');
                        this.inputs.push(argument);
                    } else if (value && Array.isArray(value) && value.every((obj) => typeof obj === 'number')) {
                        const argument = new sklearn.Argument(name, value, 'attribute');
                        this.inputs.push(argument);
                    } else if (sklearn.Utility.isType(value, 'builtins.function') || sklearn.Utility.isType(value, 'builtins.type')) {
                        const node = new sklearn.Node(metadata, '', { __class__: value }, stack);
                        const argument = new sklearn.Argument(name, node, 'object');
                        this.inputs.push(argument);
                    } else if (sklearn.Utility.isType(value, 'builtins.list') && value.every((value) => Array.isArray(value) && value.length === 2 && typeof value[0] === 'string')) {
                        const chain = stack;
                        const nodes = value.map(([name, value]) => {
                            chain.add(value);
                            const node = new sklearn.Node(metadata, name, value, chain);
                            chain.delete(value);
                            return node;
                        });
                        const argument = new sklearn.Argument(name, nodes, 'object[]');
                        this.inputs.push(argument);
                    } else if (value && Array.isArray(value) && value.length > 0 && value.every((obj) => obj && (obj.__class__ || obj === Object(obj)))) {
                        const chain = stack;
                        const values = value.filter((value) => !chain.has(value));
                        const nodes = values.map((value) => {
                            chain.add(value);
                            const node = new sklearn.Node(metadata, '', value, null, chain);
                            chain.delete(value);
                            return node;
                        });
                        const argument = new sklearn.Argument(name, nodes, 'object[]');
                        this.inputs.push(argument);
                    } else if (value && (value.__class__ || isObject(value)) && !stack.has(value)) {
                        stack.add(value);
                        const node = new sklearn.Node(metadata, '', value, null, stack);
                        const argument = new sklearn.Argument(name, node, 'object');
                        this.inputs.push(argument);
                        stack.delete(value);
                    } else {
                        let type = 'attribute';
                        let visible = true;
                        const schema = metadata.attribute(type, name);
                        if (schema) {
                            if (schema.type) {
                                type = schema.type;
                            }
                            if (schema.visible === false || (schema.optional && value === null)) {
                                visible = false;
                            } else if (schema.default !== undefined) {
                                if (Array.isArray(value)) {
                                    if (Array.isArray(schema.default)) {
                                        visible = value.length !== schema.default || !value.every((item, index) => item === metadata.default[index]);
                                    } else {
                                        visible = !value.every((item) => item === schema.default);
                                    }
                                } else {
                                    visible = value !== schema.default;
                                }
                            }
                        }
                        const argument = new sklearn.Argument(name, value, type, visible);
                        this.inputs.push(argument);
                    }
                }
            }
        }
    }
};

sklearn.Tensor = class {

    constructor(array) {
        this.type = new sklearn.TensorType(array.dtype.__name__, new sklearn.TensorShape(array.shape));
        this.stride = Array.isArray(array.strides) ? array.strides.map((stride) => stride / array.itemsize) : null;
        this.encoding = this.type.dataType === 'string' || this.type.dataType === 'object' ? '|' : array.dtype.byteorder;
        this.values = this.type.dataType === 'string' || this.type.dataType === 'object' || this.type.dataType === 'void' ? array.flatten().tolist() : array.tobytes();
    }
};

sklearn.TensorType = class {

    constructor(dataType, shape) {
        this.dataType = dataType;
        this.shape = shape;
    }

    toString() {
        return this.dataType + this.shape.toString();
    }
};

sklearn.TensorShape = class {

    constructor(dimensions) {
        this.dimensions = dimensions;
    }

    toString() {
        return this.dimensions ? (`[${this.dimensions.map((dimension) => dimension.toString()).join(',')}]`) : '';
    }
};

sklearn.Utility = class {

    static isType(obj, name) {
        return obj && obj.__class__ && obj.__class__.__module__ && obj.__class__.__name__ && `${obj.__class__.__module__}.${obj.__class__.__name__}` === name;
    }

    static isTensor = (obj) => {
        return sklearn.Utility.isType(obj, 'numpy.ndarray') || sklearn.Utility.isType(obj, 'numpy.matrix');
    };
};

sklearn.Error = class extends Error {

    constructor(message) {
        super(message);
        this.name = 'Error loading scikit-learn model.';
    }
};

export const ModelFactory = sklearn.ModelFactory;
