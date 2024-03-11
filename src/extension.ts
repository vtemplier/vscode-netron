import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';


function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function getNetronURL() {
	return `<!DOCTYPE html>
	<html lang="en">
	<style>
	html { touch-action: none; overflow: hidden; width: 100%; height: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; text-rendering: optimizeLegibility; -webkit-text-rendering: optimizeLegibility; -moz-text-rendering: optimizeLegibility; -ms-text-rendering: optimizeLegibility; -o-text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-font-smoothing: antialiased; -ms-font-smoothing: antialiased; -o-font-smoothing: antialiased; }
	body { touch-action: none; overflow: hidden; width: 100%; height: 100%; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif, "PingFang SC"; font-size: 12px; text-rendering: geometricPrecision; }
	iframe { touch-action: none; overflow: hidden; width: 100%; height: 100%; border: none; }
	</style>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Netron</title>
	</head>
	<body>
	<iframe src="https://netron.app/" title="Netron web app"></iframe>
	</body>
	</html>`;
}


export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-netron.open', (resource: vscode.Uri) => {

			// Load index file
			const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'webview', 'index.html'));
			let html = fs.readFileSync(indexPath.fsPath, 'utf8');

			// Get user model file
			let modelFile = vscode.window.activeTextEditor?.document.fileName;
			if (resource !== undefined)
			{
				modelFile = resource.fsPath;
			}

			// Get model file name
			let baseName = path.basename(modelFile!);

			// Panel creation
			const panel = vscode.window.createWebviewPanel(
				'vscode-netron',
				baseName + " [Netron]",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true,

					// And restrict the webview to only loading content from our extension's `webview` directory.
					localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron')]
				}
			);

			// Create URI variables for index.html
			const netronUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron'));
			const iconUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'icon.png'));
			const faviconUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'favicon.ico'));
			const grapherSheetUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'grapher.css'));
			const viewUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'view.js'));
			const browserUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'browser.js'));

			// Replace %variables% in html by URI values
			html = html.replace(new RegExp("%webview_cspSource%", 'g'), panel.webview.cspSource);
			html = html.replace(new RegExp("%iconPath%", 'g'), iconUri.toString());
			html = html.replace(new RegExp("%faviconPath%", 'g'), faviconUri.toString());
			html = html.replace(new RegExp("%grapherSheetPath%", 'g'), grapherSheetUri.toString());
			html = html.replace(new RegExp("%viewPath%", 'g'), viewUri.toString());
			html = html.replace(new RegExp("%browserPath%", 'g'), browserUri.toString());

			html = html.replace(new RegExp("%netronPath%", 'g'), netronUri.toString());
			
			// Use a nonce to only allow specific scripts to be run
			html = html.replace(new RegExp("%nonce%", 'g'), getNonce().toString());

			// Add name of the graph for file creation
			html = html.replace(new RegExp('%GRAPHNAME%', 'g'), baseName);

			panel.webview.html = html;

			panel.webview.onDidReceiveMessage(
				message => {
				  switch (message.command) {
					case 'request_model':
						panel.webview.postMessage({
							command: "transmit_model", 
							value: Uint8Array.from(Buffer.from(fs.readFileSync(modelFile!)))});
				  }
				},
				undefined,
				context.subscriptions
			  );
		})
	);


	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-netron.open_webbrowser', () => {

			const panel = vscode.window.createWebviewPanel(
				'vscode-netron',
				"Netron",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true
				}
			);
			
			panel.webview.html = getNetronURL();
		})
	);
}


export function deactivate() {}
