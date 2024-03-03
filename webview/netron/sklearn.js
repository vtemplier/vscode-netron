
// Experimental

const sklearn = {};

sklearn.ModelFactory = class {

    match(context) {
        const obj = context.peek('pkl');
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
                context.type = format.format;
                context.target = obj;
                return;
            }
            if (Array.isArray(obj) && obj.length > 0 && obj.every((item) => validate(item, format.name))) {
                context.type = `${format.format}.list`;
                context.target = obj;
                return;
            }
            if (Object(obj) === obj) {
                const entries = Object.entries(obj);
                if (entries.length > 0 && entries.every(([, value]) => validate(value, format.name))) {
                    context.type = `${format.format}.map`;
                    context.target = obj;
                }
            }
        }
    }

    async open(context) {
        const metadata = await context.metadata('sklearn-metadata.json');
        return new sklearn.Model(metadata, context.type, context.target);
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
                for (const [name, value] of Object.entries(obj)) {
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
        this.groups = false;
        const values = new Map();
        values.map = (name) => {
            if (!values.has(name)) {
                values.set(name, new sklearn.Value(name, null, null));
            }
            return values.get(name);
        };
        const concat = (parent, name) => {
            return (parent === '' ?  name : `${parent}/${name}`);
        };
        const process = (group, name, obj, inputs) => {
            const type = `${obj.__class__.__module__}.${obj.__class__.__name__}`;
            switch (type) {
                case 'sklearn.pipeline.Pipeline': {
                    this.groups = true;
                    name = name || 'pipeline';
                    const childGroup = concat(group, name);
                    for (const step of obj.steps) {
                        inputs = process(childGroup, step[0], step[1], inputs);
                    }
                    return inputs;
                }
                case 'sklearn.pipeline.FeatureUnion': {
                    this.groups = true;
                    const outputs = [];
                    name = name || 'union';
                    const output = concat(group, name);
                    const subgroup = concat(group, name);
                    const node = new sklearn.Node(metadata, subgroup, output, obj, inputs, [output], values);
                    this.nodes.push(node);
                    for (const transformer of obj.transformer_list) {
                        outputs.push(...process(subgroup, transformer[0], transformer[1], [output]));
                    }
                    return outputs;
                }
                case 'sklearn.compose._column_transformer.ColumnTransformer': {
                    this.groups = true;
                    name = name || 'transformer';
                    const output = concat(group, name);
                    const subgroup = concat(group, name);
                    const outputs = [];
                    const node = new sklearn.Node(metadata, subgroup, output, obj, inputs, [output], values);
                    this.nodes.push(node);
                    for (const transformer of obj.transformers) {
                        if (transformer[1] !== 'passthrough') {
                            outputs.push(...process(subgroup, transformer[0], transformer[1], [output]));
                        }
                    }
                    return outputs;
                }
                default: {
                    const output = concat(group, name);
                    const node = new sklearn.Node(metadata, group, output, obj, inputs, output === '' ? [] : [output], values);
                    this.nodes.push(node);
                    return [output];
                }
            }
        };
        process('', '', obj, []);
    }
};

sklearn.Argument = class {

    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
};

sklearn.Value = class {

    constructor(name, type, initializer) {
        if (typeof name !== 'string') {
            throw new sklearn.Error(`Invalid value identifier '${JSON.stringify(name)}'.`);
        }
        this.name = name;
        this._type = type || null;
        this.initializer = initializer || null;
    }

    get type() {
        if (this.initializer) {
            return this.initializer.type;
        }
        return this._type;
    }
};

sklearn.Node = class {

    constructor(metadata, group, name, obj, inputs, outputs, values, stack) {
        this.group = group || null;
        this.name = name || '';
        const type = obj.__class__ ? `${obj.__class__.__module__}.${obj.__class__.__name__}` : 'builtins.dict';
        this.type = metadata.type(type) || { name: type };
        this.inputs = inputs.map((input) => new sklearn.Argument(input, [values.map(input)]));
        this.outputs = outputs.map((output) => new sklearn.Argument(output, [values.map(output)]));
        this.attributes = [];
        const isArray = (obj) => {
            return obj && obj.__class__ &&
                obj.__class__.__module__ === 'numpy' && obj.__class__.__name__ === 'ndarray';
        };
        const isObject = (obj) => {
            if (obj && typeof obj === 'object') {
                const proto = Object.getPrototypeOf(obj);
                return proto === Object.prototype || proto === null;
            }
            return false;
        };
        const entries = Object.entries(obj);
        for (const [name, value] of entries) {
            if (name === '__class__') {
                continue;
            } else if (value && isArray(value)) {
                const tensor = new sklearn.Tensor(value);
                const attribute = new sklearn.Attribute(name, tensor, 'tensor');
                this.attributes.push(attribute);
            } else if (Array.isArray(value) && value.length > 0 && value.every((obj) => isArray(obj))) {
                const tensors = value.map((obj) => new sklearn.Tensor(obj));
                const attribute = new sklearn.Attribute(name, tensors, 'tensor[]');
                this.attributes.push(attribute);
            } else {
                stack = stack || new Set();
                if (value && Array.isArray(value) && value.every((obj) => typeof obj === 'string')) {
                    const attribute = new sklearn.Attribute(name, value, 'string[]');
                    this.attributes.push(attribute);
                } else if (value && Array.isArray(value) && value.every((obj) => typeof obj === 'number')) {
                    const attribute = new sklearn.Attribute(name, value);
                    this.attributes.push(attribute);
                } else if (value && value.__class__ && value.__class__.__module__ === 'builtins' && (value.__class__.__name__ === 'function' || value.__class__.__name__ === 'type')) {
                    const obj = {};
                    obj.__class__ = value;
                    const node = new sklearn.Node(metadata, group, '', obj, [], [], null, stack);
                    const attribute = new sklearn.Attribute(name, node, 'object');
                    this.attributes.push(attribute);
                } else if (value && Array.isArray(value) && value.length > 0 && value.every((obj) => obj && (obj.__class__ || obj === Object(obj)))) {
                    const values = value.filter((value) => !stack.has(value));
                    const nodes = values.map((value) => {
                        stack.add(value);
                        const node = new sklearn.Node(metadata, group, '', value, [], [], null, stack);
                        stack.delete(value);
                        return node;
                    });
                    const attribute = new sklearn.Attribute(name, nodes, 'object[]');
                    this.attributes.push(attribute);
                } else if (value && (value.__class__ || isObject(value))) {
                    if (!stack.has(value)) {
                        stack.add(value);
                        const node = new sklearn.Node(metadata, group, '', value, [], [], null, stack);
                        const attribute = new sklearn.Attribute(name, node, 'object');
                        this.attributes.push(attribute);
                        stack.delete(value);
                    }
                } else {
                    const schema = metadata.attribute(type, name);
                    if (schema) {
                        let type = undefined;
                        let visible = undefined;
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
                        const attribute = new sklearn.Attribute(name, value, type, visible);
                        this.attributes.push(attribute);
                    } else {
                        const attribute = new sklearn.Attribute(name, value);
                        this.attributes.push(attribute);
                    }
                }
            }
        }
    }
};

sklearn.Attribute = class {

    constructor(name, value, type, visible) {
        this.name = name;
        this.value = value;
        if (type) {
            this.type = type;
        }
        if (visible === false) {
            this.visible = visible;
        }
    }
};

sklearn.Tensor = class {

    constructor(array) {
        this.type = new sklearn.TensorType(array.dtype.__name__, new sklearn.TensorShape(array.shape));
        this.stride = array.strides.map((stride) => stride / array.itemsize);
        this.encoding = this.type.dataType === 'string' || this.type.dataType === 'object' ? '|' : array.dtype.byteorder;
        this.values = this.type.dataType === 'string' || this.type.dataType === 'object' ? array.tolist() : array.tobytes();
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

sklearn.Error = class extends Error {

    constructor(message) {
        super(message);
        this.name = 'Error loading scikit-learn model.';
    }
};

export const ModelFactory = sklearn.ModelFactory;
