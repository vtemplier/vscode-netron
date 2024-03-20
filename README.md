# Netron extension for VSCode

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/vincent-templier.vscode-netron?style=for-the-badge&label=VS%20Marketplace&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=vincent-templier.vscode-netron)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/vincent-templier.vscode-netron?style=for-the-badge&logo=microsoft)](https://marketplace.visualstudio.com/items?itemName=vincent-templier.vscode-netron)
[![Build Status](https://img.shields.io/github/actions/workflow/status/vtemplier/vscode-netron/ci.yaml?branch=master&style=for-the-badge&logo=github)](https://github.com/vtemplier/vscode-netron/actions?query=workflow:ci)
[![License](https://img.shields.io/github/license/vtemplier/vscode-netron?style=for-the-badge)](https://github.com/vtemplier/vscode-netron/blob/master/LICENSE)

This Visual Studio Code extension uses Netron that allows users to load and visualize machine learning and deep learning models, generated from the following frameworks and toolkits: ONNX, PyTorch, TensorFlow, TensorFlow Lite, OpenVINO, PaddlePaddle, MXNet etc. 

Currently the extension supports these file formats: `*.pt`, `*.pth`, `*.pb`, `*.mlmodel`, `*.tflite`, `*.onnx`, `*.h5`, `*.keras`, `*.paddle`, `*.pickle`, `*.safetensors`, `*.xmodel` and many more !

Feel free to test the extension with models downloaded from the [ONNX Model Zoo](https://github.com/onnx/models) or [Hugging Face](https://huggingface.co/models) 🤗.


![Demo Open in Netron](./docs/readme/Open_in_Netron.gif)

You can also open the Netron web app by selecting `Start Netron web` on your Command Palette
(Only work if you are using the extension on your host machine or with WSL).

![Demo Open Web Browser](./docs/readme/Open_Web_Browser.gif)


Special thanks to [Lutz Roeder](https://github.com/lutzroeder) and all the developers who contributed to the development of [Netron](https://github.com/lutzroeder/netron).