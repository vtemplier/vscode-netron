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


function getHtmlForWebview(context: vscode.ExtensionContext, webview: vscode.Webview) {
	
	const viewUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'view.js'));
	const browserUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'browser.js'));

	const iconUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'icon.png'));
	const faviconUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'favicon.ico'));
	const grapherSheetUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'grapher.css'));

	// Use a nonce to only allow specific scripts to be run
	const nonce = getNonce();


	return `<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="utf-8">
	<meta name="description" content="Visualizer for neural network, deep learning and machine learning models." />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
	<meta http-equiv="Content-Security-Policy" content="default-src ${webview.cspSource}; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource} 'nonce-${nonce}'; script-src-elem ${webview.cspSource} 'nonce-${nonce}'; connect-src ${webview.cspSource} https:; frame-src https:;">
	<meta name="version" content="0.0.0">
	<meta name="date" content="">
	<title>Netron</title>
	<link rel="stylesheet" nonce="${nonce}" href="${grapherSheetUri}">
	<link rel="shortcut icon" type="image/x-icon" nonce="${nonce}" href="${faviconUri}">
	<link rel="icon" type="image/png" nonce="${nonce}" href="${iconUri}">
	<link rel="apple-touch-icon" type="image/png" nonce="${nonce}" href="${iconUri}">
	<link rel="apple-touch-icon-precomposed" type="image/png" nonce="${nonce}" href="${iconUri}">
	<link rel="fluid-icon" type="image/png" nonce="${nonce}" href="${iconUri}">
	<script type="module" nonce="${nonce}" src="${viewUri}"></script>
	<script type="module" nonce="${nonce}" src="${browserUri}"></script>
	<style>
	html { touch-action: none; overflow: hidden; width: 100%; height: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; text-rendering: optimizeLegibility; -webkit-text-rendering: optimizeLegibility; -moz-text-rendering: optimizeLegibility; -ms-text-rendering: optimizeLegibility; -o-text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-font-smoothing: antialiased; -ms-font-smoothing: antialiased; -o-font-smoothing: antialiased; }
	body { touch-action: none; overflow: hidden; width: 100%; height: 100%; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif, "PingFang SC"; font-size: 12px; text-rendering: geometricPrecision; }
	button { font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif, "PingFang SC"; }
	.center { position: absolute; margin: auto; top: 0; right: 0; bottom: 0; left: 0; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
	.select { user-select: text; -webkit-user-select: text; -moz-user-select: text; }
	.graph { display: flex; height: 100%; width: 100%; overflow: auto; outline: none; touch-action: pan-x pan-y; }
	.canvas { margin: auto; flex-shrink: 0; text-rendering: geometricPrecision; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
	.open-file-dialog { display: none; }
	.default { background-color: #ffffff; }
	.default .logo { display: none; }
	.default .graph { display: flex; opacity: 1; }
	.default .toolbar { display: table; }
	.toolbar { position: absolute; bottom: 10px; left: 10px; padding: 0; margin: 0; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
	.toolbar button:focus { outline: 0; }
	.toolbar-button { float: left; background: None; border-radius: 6px; border: 0; margin: 0; margin-right: 1px; padding: 0; fill: None; stroke: #777; cursor: pointer; width: 24px; height: 24px; user-select: none; }
	.toolbar-path { float: left }
	.toolbar-path-back-button { float: left; background: #777; border-top-left-radius: 6px; border-bottom-left-radius: 6px; border: 0px solid; border-color: #777; margin: 2px 0px 2px 8px; padding: 0 8px 0 8px; cursor: pointer; height: 20px; color: #ffffff; font-size: 11px; line-height: 0; transition: 0.1s; }
	.toolbar-path-back-button:hover { background: #000000; border-color: #000000; }
	.toolbar-path-name-button { float: left; background: #777; border: 0px solid; border-color: #777; color: #ffffff; border-left: 1px; border-left-color: #ffffff; margin: 2px 0 2px 1px; padding: 0 8px 0 8px; cursor: pointer; width: auto; height: 20px; font-size: 11px; line-height: 0; transition: 0.1s; }
	.toolbar-path-name-button:hover { background: #000000; border-color: #000000; }
	.toolbar-path-name-button:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }
	.toolbar-icon .border { stroke: #fff; }
	.toolbar-icon .stroke { stroke: #808080; }
	.toolbar-icon:hover .stroke { stroke: #000000; }
	.welcome body { background-color: #ececec; }
	.welcome { background-color: #ececec; color: #242424; }
	.logo-text { top: -57px; width: 582px; transition: 0.1s; }
	.logo-name { top: -170px; width: 582px; transition: 0.1s; }
	.logo-icon { left: 248px; top: -18px; width: 106px; height: 106px; transition: 0.1s; }
	.logo-spinner { left: 248px; top: -18px; width: 106px; height: 106px; display: none; }
	.logo-stroke { stroke: #444444; }
	.logo-fill { fill: #444444; }
	.logo-border { stroke: #555555; }
	.logo-glyph { fill: #444444; }
	.logo-button { font-size: 12px; font-weight: bold; line-height: 1.25; text-align: center; vertical-align: middle; min-width: 5em; height: 2.7em; border-radius: 1.3em; transition: 0.1s; user-select: none; -webkit-user-select: none; -moz-user-select: none; color: #444444; background-color: #ececec; border: 1px solid #444444; }
	.logo-button:hover { color: #ececec; background-color: #444444; cursor: pointer; transition: 0.2s; }
	.logo-button:focus { outline: 0; }
	.logo-message { display: none; height: 0px; }
	.logo-github { display: none; }
	.open-file-button { top: 170px; left: 0px; width: 10.5em; }
	.progress { top: 120px; height: 2px; width: 400px; }
	.progress-bar { height: 100%; width: 0%; background-color: #444444; }
	.message-dialog { display: none; color: #444444; }
	.message-button { top: 224px; left: 0px; width: 125px; }
	.message-text { display: inline-flex; align-items: center; justify-content: center; text-align: center; top: 132px; height: 0px; font-size: 13px; line-height: 20px; }
	.message .message-dialog { display: block; }
	.message .logo-name { display:none; }
	.message .open-file-button { display:none; }
	.message .progress { display:none; }
	.welcome .graph { display: none; opacity: 0; }
	.welcome .menu { background-color: #ffffff; }
	.welcome.spinner .logo-spinner { display: block; -webkit-animation: orbit 0.5s infinite linear; animation: orbit 0.5s infinite linear; cursor: wait; }
	.welcome.spinner .menu-button { display: none; }
	.welcome.message .menu-button { display: none; }
	.about { overflow: hidden; }
	.about .toolbar { display: none; }
	.about .logo { display: block; background-color: #ececec; color: #666666; }
	.about .logo-message { display: block; top: 132px; font-size: 14px; }
	.about .logo-github { display: block; top: 340px; width: 48px; height: 48px; }
	.about a { text-decoration: none; color: #666666; }
	.about a:visited { color: inherit; }
	.about a:hover { color: #242424; }
	.about .open-file-button { display: none; }
	.about .logo-name { display: none; }
	.about .message { display: none; }
	.about .progress { display: none; }
	.about .menu-button { display: none; }
	.titlebar { color: #aaaaaa; display: none; height: 32px; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 2; -webkit-app-region: drag; }
	.titlebar-visible { display: block; }
	.titlebar-content { display: block; padding: 0 142px; height: 100%; text-align: center; font-size: 14px; line-height: 32px; transition: all .1s ease-in-out; user-select: none; }
	.titlebar-content-text { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.spinner .titlebar-content { opacity: 0; }
	.active .titlebar { color: #464646; transition: all 0.05s ease-in-out; }
	.titlebar-control-box { display: none; align-items: center; flex-direction: row-reverse; height: 100%; position: absolute; top: 0; right: 0; width: 138px; }
	.titlebar-control-box-visible { display: flex; }
	.titlebar-icon { width: 1em; height: 1em; vertical-align: -0.15em; fill: currentColor; overflow: hidden; }
	.titlebar-button { display: flex; justify-content: center; align-items: center; width: 46px; height: 32px; user-select: none; -webkit-app-region: no-drag; }
	.titlebar-button:hover { color: #000000; background-color: rgba(0, 0, 0, 0.15); }
	.titlebar-button-close:hover { color: #ffffff; background-color: #b43029; }
	.menu-button { display: flex; justify-content: center; align-items: center; color: #aaaaaa; font-size: 20px; height: 32px; width: 32px; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 2; -webkit-app-region: no-drag; -webkit-app-region: no-drag; user-select: none; }
	.menu-button:hover { color: #000000; }
	.menu { display: block; position: absolute; left: -17em; width: 17em; top: 0; height: 100%; z-index: 2; background-color: #ececec; border-right: 1px solid rgba(255, 255, 255, 0.5); padding-top: 40px; padding-bottom: 2px; margin-left: 0; margin-top: 0; overflow: hidden; transition: 0.1s; }
	.menu .menu-group { margin-bottom: 12px; }
	.menu .menu-group .menu-group-header { display: block; border: none; border-radius: 0; color: black; width: 100%; text-align: left; margin: 4px 12px 5px 12px; white-space: no-wrap; font-size: 11px; font-weight: bold; color: #bbbbbb; white-space: nowrap; }
	.menu .menu-group .menu-command { display: block; border: none; border-radius: 0; background-color: transparent; color: black; width: 100%; text-align: left; padding: 4px 12px 5px 12px; font-size: 12px; }
	.menu .menu-group .menu-command:focus { color: #ffffff; background-color: #2e6bd2; outline: none; }
	.menu .menu-group .menu-command:disabled { color: #888888; }
	.menu .menu-group .menu-command .menu-label { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
	.menu .menu-group .menu-command .menu-shortcut { display: block; float: right; margin-left: 25px; color: #888888; }
	.menu .menu-group .menu-separator { border-top: 1px; border-bottom: 0; border-style: solid; border-color: #e5e5e5; margin-left: 12px; margin-right: 12px; }
	.about .titlebar-visible { opacity: 0; }
	@-webkit-keyframes orbit { 0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); } }
	@keyframes orbit { 0% { -webkit-transform: rotate(0deg); transform: rotate(0deg); }  100% { -webkit-transform: rotate(360deg); transform: rotate(360deg); } }
	.welcome.spinner .logo-spinner-stroke { stroke: #ececec; }
	.welcome.spinner .logo-name { display: none; }
	.welcome.spinner .open-file-button { display: none; }
	.welcome.spinner .graph { display: flex; opacity: 0; }
	.welcome .message .logo-name { display: none; }
	.welcome .message .open-file-button { display: none; }
	.welcome .toolbar { display: none; }
	@media (prefers-color-scheme: dark) {
	:root { color-scheme: dark; }
	.default { background-color: #404040; }
	.graph { background-color: #404040; }
	.welcome { background-color: #1e1e1e; color: #888888; }
	.logo-stroke { stroke: #888888; }
	.logo-fill { fill: #888888; }
	.logo-border { stroke: #000000; }
	.logo-glyph { fill: #888888; }
	.logo-spinner-stroke { stroke: #ffffff; }
	.logo-button { color: #888888; background-color: #1e1e1e; border-color: #888888; }
	.logo-button:hover { color: #1e1e1e; background-color: #888888; }
	.message-dialog { color: #888888; }
	.welcome .progress-bar { background-color: #888888; }
	.welcome .menu { background-color: #2d2d2d }
	.about .logo { background-color: #1e1e1e; color: #888888; }
	.about a { color: #c6c6c6; }
	.about a:hover { color: #ffffff; }
	.toolbar-icon .border { stroke: #1d1d1d; }
	.toolbar-icon .stroke { stroke: #aaaaaa; }
	.toolbar-icon:hover .stroke { stroke: #dfdfdf; }
	.toolbar-path-back-button { background: #aaaaaa; border-color: #aaaaaa; color: #333333; }
	.toolbar-path-back-button:hover { background: #dfdfdf; border-color: #dfdfdf; }
	.toolbar-path-name-button { background: #aaaaaa ; border-color: #aaaaaa; color: #404040; }
	.toolbar-path-name-button:hover { background: #dfdfdf; border-color: #dfdfdf; }
	.titlebar { color: #949494; }
	.welcome body { background-color: #1e1e1e; }
	.default body { background-color: #404040; }
	.active .titlebar { color: #c4c4c4; }
	.titlebar-button:hover { color: #ffffff; background-color: rgba(0, 0, 0, 0.15); }
	.titlebar-button-close:hover { color: #ffffff; background-color: #b43029; }
	.menu-button { color: #aaaaaa; }
	.menu-button:hover { color: #ffffff; }
	.menu { background-color: #2d2d2d; border-color: rgba(0, 0, 0, 0); }
	.menu .menu-group .menu-group-header { color: #666666; }
	.menu .menu-group .menu-command { color: #ffffff; }
	.menu .menu-group .menu-command:focus { color: #ffffff; background-color: #2e6bd2; }
	.menu .menu-group .menu-command:disabled { color: #888888; }
	.menu .menu-group .menu-command .shortcut { color: #888888; }
	.menu .menu-group .menu-separator { border-color: #363636; }
	}
	@media all and (max-width: 640px) {
	.logo { width: 240px; }
	.logo-text { opacity: 0; }
	.logo-name { opacity: 0; }
	.logo-icon { left: 0; top: 0; width: 128px; height: 128px; }
	.logo-spinner { left: 0; top: 0; width: 128px; height: 128px; }
	.logo .open-file-button { top: 204px; left: 0; }
	.message-dialog .message-button { top: 304px; }
	.message-dialog .message-text { top: 190px; width: 240px; }
	.progress { top: 160px; height: 2px; width: 100px; }
	.about .logo { width: 100%; padding-left: 0; padding-right: 0; }
	.about .logo-message { top: 175px; font-size: 12px; }
	.about .logo-github { top: 370px; }
	}
	@media only screen and (max-device-width: 1024px) {
	.toolbar-button { width: 32px; height: 32px; }
	.toolbar-path-back-button { margin-top: 6px; margin-bottom: 6px; }
	.toolbar-path-name-button { margin-top: 6px; margin-bottom: 6px; }
	}
	.sidebar { display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, "Segoe WPC", "Segoe UI", "Ubuntu", "Droid Sans", sans-serif; font-size: 12px; height: 100%; right: -100%; position: fixed; transition: 0.1s; top: 0; background-color: #ececec; color: #242424; overflow: hidden; border-left: 1px solid rgba(255, 255, 255, 0.5); opacity: 0; }
	.sidebar-title { font-weight: bold; font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase; height: 20px; margin: 0; padding: 20px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
	.sidebar-closebutton { padding: 8px 8px 8px 32px; text-decoration: none; font-size: 25px; color: #777777; opacity: 1.0; display: block; transition: 0.2s; position: absolute; top: 0; right: 15px; margin-left: 50px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
	.sidebar-closebutton:hover { color: #242424; }
	.sidebar-content { display: flex; flex-direction: column; flex-grow: 1; height: 0; }
	.sidebar-header { font-weight: bold; font-size: 11px; text-transform: uppercase; line-height: 1.25; margin-top: 16px; margin-bottom: 16px; border-bottom: 1px solid #ececec; display: block; user-select: none; -webkit-user-select: none; -moz-user-select: none; cursor: default; }
	.sidebar-object { flex-grow: 1; padding: 0px 20px 20px 20px; overflow-y: auto; }
	.sidebar-item { margin-bottom: 0px; display: block; }
	.sidebar-item-name { float: left; font-size: 11px; min-width: 95px; max-width: 95px; padding-right: 5px; padding-top: 7px; display: block; }
	.sidebar-item-name input { color: #777; font-family: inherit; font-size: inherit; color: inherit; background-color: inherit; width: 100%; text-align: right; margin: 0; padding: 0; border: 0; outline: none; text-overflow: ellipsis; }
	.sidebar-item-value-list { margin: 0; margin-left: 105px; overflow: hidden; display: block; padding: 0; }
	.sidebar-item-value { font-size: 11px; background-color: #fcfcfc; border-radius: 2px; border: 1px solid #fcfcfc; margin-top: 3px; margin-bottom: 3px; overflow: auto; }
	.sidebar-item-value-dark { background-color: #f8f8f8; border: 1px solid #f8f8f8; }
	.sidebar-item-value b { font-weight: bold; }
	.sidebar-item-value code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; overflow: auto; white-space: pre-wrap; word-wrap: break-word; }
	.sidebar-item-value pre { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; margin: 0; overflow: auto; white-space: pre; word-wrap: normal; display: block; }
	.sidebar-item-value-line { padding: 4px 6px 4px 6px; }
	.sidebar-item-value-line-link { padding: 4px 6px 4px 6px; cursor: default; overflow-x: auto; white-space: nowrap; }
	.sidebar-item-value-line-link:hover { text-decoration: underline; }
	.sidebar-item-value-line-border { padding: 4px 6px 4px 6px; border-top: 1px solid rgba(27, 31, 35, 0.05); }
	.sidebar-item-value-line-content { white-space: pre; word-wrap: normal; overflow: auto; display: block; }
	.sidebar-item-value-expander { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; float: right; color: #aaa; cursor: pointer; user-select: none; -webkit-user-select: none; -moz-user-select: none; padding: 4px 6px 4px 6px; }
	.sidebar-item-value-expander:hover { color: #000; }
	.sidebar-item-select {
		font-family: inherit; font-size: 12px;
		background-color: #fcfcfc; border: #fcfcfc; color: #333;
		border-radius: 2px; width: 100%; height: 23px; padding: 3px 12px 3px 7px;
		margin-top: 3px; margin-bottom: 3px; outline: none;
		box-sizing: border-box; -moz-box-sizing: border-box;
		appearance: none; -webkit-appearance: none; -moz-appearance: none;
		background-image: linear-gradient(45deg, transparent 50%, #333 50%), linear-gradient(135deg, #333 50%, transparent 50%);
		background-position: calc(100% - 12px) calc(10px), calc(100% - 7px) calc(10px);
		background-size: 5px 5px, 5px 5px;
		background-repeat: no-repeat;
	}
	.sidebar-separator { margin-bottom: 20px; }
	.sidebar-find-search { font-family: inherit; font-size: 13px; margin: 0px 20px 8px 20px; padding: 8px 16px 8px 16px; background: #fff; border-radius: 16px; border: 0; outline: 0; }
	.sidebar-find-content { flex-grow: 1; padding: 0px 20px 20px 20px; padding-right: 20px; overflow-y: auto; list-style-type: none; overflow-y: auto; margin: 0; }
	.sidebar-find-content li { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 12px; margin: 0; padding: 5px 8px 5px 18px; outline: 0; white-space: nowrap; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
	.sidebar-find-content li:hover { background: #e5e5e5; }
	.sidebar-documentation { flex-grow: 1; padding: 0px 20px 20px 20px; overflow-y: auto; font-size: 13px; line-height: 1.5; margin: 0; }
	.sidebar-documentation h1 { font-weight: bold; font-size: 13px; line-height: 1.25; border-bottom: 1px solid #e8e8e8; padding-bottom: 0.3em; margin-top: 0; margin-bottom: 16px; }
	.sidebar-documentation h2 { font-weight: bold; font-size: 13px; line-height: 1.25; margin-top: 20px; margin-bottom: 16px; text-transform: uppercase; border: 0; }
	.sidebar-documentation h3 { font-weight: bold; font-size: 11px; line-height: 1.25; }
	.sidebar-documentation p { margin-top: 4px; margin-bottom: 4px; margin-left: 0px; }
	.sidebar-documentation a { color: #237; }
	.sidebar-documentation code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 12px; background-color: rgba(27, 31, 35, 0.05); padding: 0.2em 0.4em; margin: 0; border-radius: 3px; }
	.sidebar-documentation pre { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 12px; padding: 16px; overflow: auto; line-height: 1.45; background-color: rgba(27, 31, 35, 0.05); border-radius: 3px; }
	.sidebar-documentation pre code { font-size: 13px; padding: 16px; line-height: 1.45; background-color: transparent; padding: 0; border-radius: 0; }
	.sidebar-documentation tt { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-weight: bold; font-size: 90%; background-color: rgba(27, 31, 35, 0.05); border-radius: 3px; padding: 0.2em 0.4em; margin: 0; }
	.sidebar-documentation dl dt { font-size: 13px; font-weight: bold; padding: 0; margin-top: 16px; margin-left: 0px; }
	.sidebar-documentation dd { padding: 0 16px; margin-left: 0; margin-bottom: 16px; }
	.sidebar-documentation ul { margin-top: 6px; margin-bottom: 6px; padding-left: 20px; }
	.sidebar-documentation blockquote { margin-left: 15px; margin-right: 15px; }
	@media (prefers-color-scheme: dark) {
		.sidebar html { color: #dfdfdf; }
		.sidebar { background-color: #2d2d2d; color: #dfdfdf; border-left: 1px solid rgba(0, 0, 0, 0); }
		.sidebar-closebutton { padding: 8px 8px 8px 32px; text-decoration: none; font-size: 25px; color: #777777; opacity: 1.0; display: block; transition: 0.2s; position: absolute; top: 0; right: 15px; margin-left: 50px; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
		.sidebar-closebutton:hover { color: #ffffff; }
		.sidebar-item-value { background-color: #383838; border-color: #383838; }
		.sidebar-item-value-dark { background-color: #3e3e3e; border-color: #3e3e3e; }
		.sidebar-item-value-line-border { border-color: rgba(0, 0, 0, 0.09); }
		.sidebar-item-select { background-color: #383838; border: #383838; color: #dfdfdf; background-image: linear-gradient(45deg, transparent 50%, #aaa 50%), linear-gradient(135deg, #aaa 50%, transparent 50%); }
		.sidebar-header { border-bottom-color: #2d2d2d; color: #dfdfdf; }
		.sidebar-documentation h1 { border-bottom: 1px solid #424242; color: #dfdfdf; }
		.sidebar-documentation h2 { color: #dfdfdf; }
		.sidebar-documentation p { color: #aaaaaa; }
		.sidebar-documentation a { color: #6688aa; }
		.sidebar-documentation tt { background-color:#1e1e1e; }
		.sidebar-documentation code { background-color: #1e1e1e; }
		.sidebar-documentation pre { background-color: #1e1e1e; }
		.sidebar-find-search { background: #383838; color: #dfdfdf; border-color: #424242; }
		.sidebar-find-content li:hover { background: #383838; }
	}
	@media screen and (prefers-reduced-motion: reduce) {
	.menu { transition: none; }
	.sidebar { transition: none; }
	}
	</style>
	</head>
	<body class="welcome spinner">
	<div id="graph" class="graph" tabindex="0">
		<svg id="canvas" class="canvas" preserveaspectratio="xMidYMid meet" width="100%" height="100%"></svg>
	</div>
	<div id="sidebar" class="sidebar">
		<h1 id="sidebar-title" class="sidebar-title"></h1>
		<a id="sidebar-closebutton" class="sidebar-closebutton" href="javascript:void(0)" draggable="false">&times;</a>
		<div id="sidebar-content" class="sidebar-content"></div>
	</div>
	<div id="toolbar" class="toolbar">
		<button id="sidebar-button" class="toolbar-button" title="Model Properties">
			<svg class="toolbar-icon" viewbox="0 0 100 100">
				<rect class="border" x="12" y="12" width="76" height="76" rx="16" ry="16" stroke-width="8"></rect>
				<line class="border" x1="28" y1="37" x2="32" y2="37" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="28" y1="50" x2="32" y2="50" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="28" y1="63" x2="32" y2="63" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="40" y1="37" x2="70" y2="37" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="40" y1="50" x2="70" y2="50" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="40" y1="63" x2="70" y2="63" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<rect class="stroke" x="12" y="12" width="76" height="76" rx="16" ry="16" stroke-width="4"></rect>
				<line class="stroke" x1="28" y1="37" x2="32" y2="37" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="28" y1="50" x2="32" y2="50" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="28" y1="63" x2="32" y2="63" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="40" y1="37" x2="70" y2="37" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="40" y1="50" x2="70" y2="50" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="40" y1="63" x2="70" y2="63" stroke-width="4" stroke-linecap="round"></line>
			</svg>
		</button>
		<button id="zoom-in-button" class="toolbar-button" title="Zoom In">
			<svg class="toolbar-icon" viewbox="0 0 100 100">
				<circle class="border" cx="50" cy="50" r="35" stroke-width="8" stroke="#fff"></circle>
				<line class="border" x1="50" y1="38" x2="50" y2="62" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="38" y1="50" x2="62" y2="50" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="78" y1="78" x2="82" y2="82" stroke-width="12" stroke-linecap="square" stroke="#fff"></line>
				<circle class="stroke" cx="50" cy="50" r="35" stroke-width="4"></circle>
				<line class="stroke" x1="50" y1="38" x2="50" y2="62" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="38" y1="50" x2="62" y2="50" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="78" y1="78" x2="82" y2="82" stroke-width="8" stroke-linecap="square"></line>
			</svg>
		</button>
		<button id="zoom-out-button" class="toolbar-button" title="Zoom Out">
			<svg class="toolbar-icon" viewbox="0 0 100 100">
				<circle class="border" cx="50" cy="50" r="35" stroke-width="8" stroke="#fff"></circle>
				<line class="border" x1="38" y1="50" x2="62" y2="50" stroke-width="8" stroke-linecap="round" stroke="#fff"></line>
				<line class="border" x1="78" y1="78" x2="82" y2="82" stroke-width="12" stroke-linecap="square" stroke="#fff"></line>
				<circle class="stroke" cx="50" cy="50" r="35" stroke-width="4"></circle>
				<line class="stroke" x1="38" y1="50" x2="62" y2="50" stroke-width="4" stroke-linecap="round"></line>
				<line class="stroke" x1="78" y1="78" x2="82" y2="82" stroke-width="8" stroke-linecap="square"></line>
			</svg>
		</button>
		<div id="toolbar-path" class="toolbar-path">
			<button id="toolbar-path-back-button" class="toolbar-path-back-button" title="Back">
				&#x276E;
			</button>
		</div>
	</div>
	<div id="logo" class="center logo">
		<a href="https://github.com/vtemplier/vscode-netron" target="blank_">
			<svg class="center logo-text" viewbox="0 0 5120 1024">
				<g transform="scale(9) translate(-44,-15)">
					<g transform="matrix(100,0,0,100,60.9965,126)">
						<path class="logo-glyph" d="M0.089,0L0.089,-0.745L0.595,-0.147L0.595,-0.715L0.656,-0.715L0.656,0.021L0.15,-0.578L0.15,0L0.089,0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(100,0,0,100,164.341,126)">
						<path class="logo-glyph" d="M0.089,0L0.089,-0.715L0.443,-0.715L0.443,-0.654L0.154,-0.654L0.154,-0.43L0.443,-0.43L0.443,-0.369L0.154,-0.369L0.154,-0.061L0.443,-0.061L0.443,0L0.089,0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(100,0,0,100,244.491,126)">
						<path class="logo-glyph" d="M0.216,0L0.216,-0.654L0.019,-0.654L0.019,-0.715L0.478,-0.715L0.478,-0.654L0.281,-0.654L0.281,0L0.216,0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(100,0,0,100,323.031,126)">
						<path class="logo-glyph" d="M0.154,-0.658L0.154,-0.394L0.219,-0.394C0.28,-0.394 0.322,-0.404 0.346,-0.423C0.37,-0.442 0.382,-0.475 0.382,-0.522C0.382,-0.571 0.369,-0.606 0.345,-0.627C0.32,-0.648 0.278,-0.658 0.219,-0.658L0.154,-0.658ZM0.523,0L0.444,0L0.193,-0.341L0.154,-0.341L0.154,0L0.089,0L0.089,-0.715L0.22,-0.715C0.298,-0.715 0.356,-0.699 0.394,-0.667C0.433,-0.634 0.452,-0.585 0.452,-0.52C0.452,-0.464 0.436,-0.421 0.403,-0.389C0.37,-0.357 0.324,-0.341 0.266,-0.341L0.523,0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(100,0,0,100,520.979,126)">
						<path class="logo-glyph" d="M0.089,0L0.089,-0.745L0.595,-0.147L0.595,-0.715L0.656,-0.715L0.656,0.021L0.15,-0.578L0.15,0L0.089,0Z" style="fill-rule:nonzero;"/>
					</g>
				</g>
			</svg>
			<svg class="center logo-icon" viewbox="0 0 1024 1024">
				<circle class="logo-stroke" cx="512" cy="512" r="431" fill="none" stroke-width="32"></circle>
				<circle class="logo-border" cx="512" cy="512" r="450" fill="none" stroke-width="6"></circle>
				<circle class="logo-border" cx="512" cy="512" r="412" fill="none" stroke-width="6"></circle>
				<line class="logo-stroke" x1="296" y1="392" x2="540" y2="280" stroke-width="12"></line>
				<line class="logo-stroke" x1="296" y1="632" x2="540" y2="280" stroke-width="12"></line>
				<line class="logo-stroke" x1="296" y1="392" x2="540" y2="435" stroke-width="12"></line>
				<line class="logo-stroke" x1="296" y1="632" x2="540" y2="435" stroke-width="12"></line>
				<line class="logo-stroke" x1="296" y1="392" x2="540" y2="590" stroke-width="12"></line>
				<line class="logo-stroke" x1="296" y1="632" x2="540" y2="590" stroke-width="12"></line>
				<line class="logo-stroke" x1="296" y1="392" x2="540" y2="744" stroke-width="12"></line>
				<line class="logo-stroke" x1="296" y1="632" x2="540" y2="744" stroke-width="12"></line>
				<line class="logo-stroke" x1="540" y1="280" x2="785" y2="512" stroke-width="12"></line>
				<line class="logo-stroke" x1="540" y1="590" x2="785" y2="512" stroke-width="12"></line>
				<line class="logo-stroke" x1="540" y1="435" x2="785" y2="512" stroke-width="12"></line>
				<line class="logo-stroke" x1="540" y1="744" x2="785" y2="512" stroke-width="12"></line>
				<g transform="translate(296, 392)">
					<circle class="logo-fill" cx="0" cy="0" r="51"></circle>
					<circle class="logo-border" cx="0" cy="0" r="51" fill="none" stroke-width="6"></circle>
				</g>
				<g transform="translate(296, 632)">
					<circle class="logo-fill" cx="0" cy="0" r="51"></circle>
					<circle class="logo-border" cx="0" cy="0" r="51" fill="none" stroke-width="6"></circle>
				</g>
				<g transform="translate(540, 280)">
					<circle class="logo-fill" cx="0" cy="0" r="51"></circle>
					<circle class="logo-border" cx="0" cy="0" r="51" fill="none" stroke-width="6"></circle>
				</g>
				<g transform="translate(540, 435)">
					<circle class="logo-fill" cx="0" cy="0" r="51"></circle>
					<circle class="logo-border" cx="0" cy="0" r="51" fill="none" stroke-width="6"></circle>
				</g>
				<g transform="translate(540, 590)">
					<circle class="logo-fill" cx="0" cy="0" r="51"></circle>
					<circle class="logo-border" cx="0" cy="0" r="51" fill="none" stroke-width="6"></circle>
				</g>
				<g transform="translate(540, 744)">
					<circle class="logo-fill" cx="0" cy="0" r="51"></circle>
					<circle class="logo-border" cx="0" cy="0" r="51" fill="none" stroke-width="6"></circle>
				</g>
				<g transform="translate(785, 512)">
					<circle class="logo-fill" cx="0" cy="0" r="51"></circle>
					<circle class="logo-border" cx="0" cy="0" r="51" fill="none" stroke-width="6"></circle>
				</g>
			</svg>
			<svg id="logo-spinner" class="center logo-spinner" viewbox="0 0 1024 1024">
				<g transform="translate(512, 512)" style="opacity: 1">
					<path class="logo-spinner-stroke" d="M-431,0 A-431,-431 0 0,1 0,-431" stroke-width="24" fill="None"></path>
				</g>
			</svg>
		</a>
		<a href="https://www.lutzroeder.com" target="blank_">
			<svg class="center logo-name" viewbox="0 0 5120 300">
				<g transform="scale(5.8) translate(20, 0)">
					<g transform="matrix(30,0,0,30,18.9123,38)">
						<path class="logo-glyph" d="M0.089,-0L0.089,-0.715L0.154,-0.715L0.154,-0.061L0.399,-0.061L0.399,-0L0.089,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,46.7613,38)">
						<path class="logo-glyph" d="M0.086,-0.715L0.15,-0.715L0.15,-0.248C0.15,-0.177 0.166,-0.125 0.198,-0.091C0.23,-0.056 0.28,-0.039 0.346,-0.039C0.412,-0.039 0.46,-0.056 0.493,-0.091C0.525,-0.125 0.541,-0.177 0.541,-0.248L0.541,-0.715L0.606,-0.715L0.606,-0.269C0.606,-0.172 0.584,-0.1 0.542,-0.052C0.499,-0.005 0.433,0.019 0.346,0.019C0.259,0.019 0.193,-0.005 0.15,-0.052C0.107,-0.1 0.086,-0.172 0.086,-0.269L0.086,-0.715Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,83.5133,38)">
						<path class="logo-glyph" d="M0.216,-0L0.216,-0.654L0.019,-0.654L0.019,-0.715L0.478,-0.715L0.478,-0.654L0.281,-0.654L0.281,-0L0.216,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,114.421,38)">
						<path class="logo-glyph" d="M0.012,-0L0.437,-0.656L0.074,-0.656L0.074,-0.715L0.548,-0.715L0.125,-0.06L0.505,-0.06L0.505,-0L0.012,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,171.777,38)">
						<path class="logo-glyph" d="M0.154,-0.658L0.154,-0.394L0.219,-0.394C0.28,-0.394 0.322,-0.404 0.346,-0.423C0.37,-0.442 0.382,-0.475 0.382,-0.522C0.382,-0.571 0.369,-0.606 0.345,-0.627C0.32,-0.648 0.278,-0.658 0.219,-0.658L0.154,-0.658ZM0.523,-0L0.444,-0L0.193,-0.341L0.154,-0.341L0.154,-0L0.089,-0L0.089,-0.715L0.22,-0.715C0.298,-0.715 0.356,-0.699 0.394,-0.667C0.433,-0.634 0.452,-0.585 0.452,-0.52C0.452,-0.464 0.436,-0.421 0.403,-0.389C0.37,-0.357 0.324,-0.341 0.266,-0.341L0.523,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,203.607,38)">
						<path class="logo-glyph" d="M0.437,-0.039C0.479,-0.039 0.519,-0.047 0.557,-0.063C0.595,-0.078 0.629,-0.101 0.659,-0.131C0.689,-0.161 0.712,-0.196 0.727,-0.234C0.743,-0.273 0.751,-0.313 0.751,-0.356C0.751,-0.399 0.743,-0.44 0.728,-0.478C0.712,-0.516 0.689,-0.55 0.659,-0.581C0.63,-0.611 0.596,-0.634 0.558,-0.649C0.52,-0.665 0.48,-0.673 0.437,-0.673C0.395,-0.673 0.355,-0.665 0.317,-0.649C0.28,-0.634 0.246,-0.611 0.216,-0.581C0.186,-0.55 0.163,-0.516 0.147,-0.478C0.132,-0.44 0.124,-0.399 0.124,-0.356C0.124,-0.313 0.132,-0.272 0.147,-0.234C0.163,-0.196 0.186,-0.161 0.216,-0.131C0.246,-0.101 0.279,-0.078 0.316,-0.062C0.354,-0.047 0.394,-0.039 0.437,-0.039ZM0.82,-0.356C0.82,-0.306 0.81,-0.258 0.791,-0.212C0.772,-0.167 0.744,-0.126 0.708,-0.091C0.671,-0.055 0.63,-0.028 0.583,-0.009C0.537,0.01 0.488,0.019 0.437,0.019C0.386,0.019 0.337,0.01 0.291,-0.009C0.245,-0.028 0.203,-0.055 0.167,-0.091C0.131,-0.127 0.103,-0.168 0.084,-0.213C0.065,-0.258 0.055,-0.306 0.055,-0.356C0.055,-0.407 0.065,-0.455 0.084,-0.501C0.103,-0.546 0.131,-0.587 0.167,-0.623C0.203,-0.659 0.244,-0.685 0.29,-0.704C0.335,-0.722 0.385,-0.731 0.437,-0.731C0.49,-0.731 0.539,-0.722 0.585,-0.703C0.631,-0.685 0.672,-0.658 0.708,-0.623C0.744,-0.587 0.772,-0.546 0.791,-0.501C0.81,-0.455 0.82,-0.407 0.82,-0.356Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,245.853,38)">
						<path class="logo-glyph" d="M0.089,-0L0.089,-0.715L0.443,-0.715L0.443,-0.654L0.154,-0.654L0.154,-0.43L0.443,-0.43L0.443,-0.369L0.154,-0.369L0.154,-0.061L0.443,-0.061L0.443,-0L0.089,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,277.243,38)">
						<path class="logo-glyph" d="M0.154,-0.056L0.245,-0.056C0.319,-0.056 0.371,-0.06 0.402,-0.069C0.433,-0.077 0.459,-0.091 0.481,-0.111C0.511,-0.139 0.534,-0.174 0.549,-0.215C0.564,-0.257 0.572,-0.305 0.572,-0.358C0.572,-0.413 0.564,-0.461 0.549,-0.502C0.533,-0.544 0.51,-0.578 0.48,-0.605C0.457,-0.625 0.429,-0.64 0.396,-0.648C0.364,-0.657 0.306,-0.661 0.224,-0.661L0.154,-0.661L0.154,-0.056ZM0.089,-0L0.089,-0.715L0.2,-0.715C0.299,-0.715 0.37,-0.71 0.412,-0.7C0.453,-0.69 0.489,-0.674 0.519,-0.65C0.559,-0.618 0.589,-0.578 0.61,-0.528C0.631,-0.478 0.641,-0.421 0.641,-0.357C0.641,-0.293 0.631,-0.236 0.61,-0.186C0.589,-0.136 0.559,-0.096 0.52,-0.066C0.489,-0.042 0.454,-0.025 0.414,-0.015C0.374,-0.005 0.31,-0 0.222,-0L0.089,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,314.142,38)">
						<path class="logo-glyph" d="M0.089,-0L0.089,-0.715L0.443,-0.715L0.443,-0.654L0.154,-0.654L0.154,-0.43L0.443,-0.43L0.443,-0.369L0.154,-0.369L0.154,-0.061L0.443,-0.061L0.443,-0L0.089,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,345.532,38)">
						<path class="logo-glyph" d="M0.154,-0.658L0.154,-0.394L0.219,-0.394C0.28,-0.394 0.322,-0.404 0.346,-0.423C0.37,-0.442 0.382,-0.475 0.382,-0.522C0.382,-0.571 0.369,-0.606 0.345,-0.627C0.32,-0.648 0.278,-0.658 0.219,-0.658L0.154,-0.658ZM0.523,-0L0.444,-0L0.193,-0.341L0.154,-0.341L0.154,-0L0.089,-0L0.089,-0.715L0.22,-0.715C0.298,-0.715 0.356,-0.699 0.394,-0.667C0.433,-0.634 0.452,-0.585 0.452,-0.52C0.452,-0.464 0.436,-0.421 0.403,-0.389C0.37,-0.357 0.324,-0.341 0.266,-0.341L0.523,-0Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,376.911,38)">
						<path class="logo-glyph" d="M0.06,-0.468L0.155,-0.731L0.228,-0.699L0.1,-0.452L0.06,-0.468Z" style="fill-rule:nonzero;"/>
					</g>
					<g transform="matrix(30,0,0,30,401.549,38)">
						<path class="logo-glyph" d="M0.034,-0.12L0.09,-0.15C0.1,-0.115 0.118,-0.087 0.144,-0.068C0.169,-0.049 0.2,-0.039 0.236,-0.039C0.281,-0.039 0.316,-0.052 0.342,-0.079C0.367,-0.106 0.38,-0.143 0.38,-0.19C0.38,-0.224 0.371,-0.253 0.354,-0.276C0.337,-0.299 0.3,-0.325 0.244,-0.355C0.172,-0.393 0.124,-0.427 0.101,-0.456C0.077,-0.485 0.065,-0.519 0.065,-0.56C0.065,-0.611 0.082,-0.652 0.116,-0.684C0.151,-0.716 0.195,-0.732 0.25,-0.732C0.286,-0.732 0.317,-0.724 0.344,-0.709C0.37,-0.694 0.392,-0.671 0.408,-0.641L0.358,-0.611C0.347,-0.631 0.333,-0.647 0.314,-0.658C0.295,-0.668 0.272,-0.674 0.246,-0.674C0.211,-0.674 0.183,-0.663 0.162,-0.643C0.141,-0.622 0.131,-0.594 0.131,-0.559C0.131,-0.509 0.172,-0.462 0.255,-0.419C0.27,-0.411 0.281,-0.405 0.289,-0.401C0.35,-0.367 0.391,-0.336 0.411,-0.306C0.432,-0.276 0.442,-0.237 0.442,-0.19C0.442,-0.126 0.423,-0.075 0.386,-0.037C0.348,0 0.297,0.019 0.233,0.019C0.186,0.019 0.146,0.007 0.113,-0.016C0.079,-0.039 0.053,-0.074 0.034,-0.12Z" style="fill-rule:nonzero;"/>
					</g>
				</g>
			</svg>
		</a>
		<div class="center logo-message">
			<div style="height: 30px; text-align: center;">Version <span id="version" class="select">{version}</span></div>
			<div style="height: 30px; text-align: center;">Copyright &copy; <a href="https://www.lutzroeder.com" target="blank_">Lutz Roeder</a></div>
		</div>
		<a id="logo-github" class="center logo-github" href="https://github.com/vtemplier/vscode-netron" target="blank_">
			<svg viewbox="0 0 438.549 438.549">
				<path class="logo-fill" d="M409.132,114.573c-19.608-33.596-46.205-60.194-79.798-79.8C295.736,15.166,259.057,5.365,219.271,5.365
					c-39.781,0-76.472,9.804-110.063,29.408c-33.596,19.605-60.192,46.204-79.8,79.8C9.803,148.168,0,184.854,0,224.63
					c0,47.78,13.94,90.745,41.827,128.906c27.884,38.164,63.906,64.572,108.063,79.227c5.14,0.954,8.945,0.283,11.419-1.996
					c2.475-2.282,3.711-5.14,3.711-8.562c0-0.571-0.049-5.708-0.144-15.417c-0.098-9.709-0.144-18.179-0.144-25.406l-6.567,1.136
					c-4.187,0.767-9.469,1.092-15.846,1c-6.374-0.089-12.991-0.757-19.842-1.999c-6.854-1.231-13.229-4.086-19.13-8.559
					c-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559
					c-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-0.951-2.568-2.098-3.711-3.429c-1.142-1.331-1.997-2.663-2.568-3.997
					c-0.572-1.335-0.098-2.43,1.427-3.289c1.525-0.859,4.281-1.276,8.28-1.276l5.708,0.853c3.807,0.763,8.516,3.042,14.133,6.851
					c5.614,3.806,10.229,8.754,13.846,14.842c4.38,7.806,9.657,13.754,15.846,17.847c6.184,4.093,12.419,6.136,18.699,6.136
					c6.28,0,11.704-0.476,16.274-1.423c4.565-0.952,8.848-2.383,12.847-4.285c1.713-12.758,6.377-22.559,13.988-29.41
					c-10.848-1.14-20.601-2.857-29.264-5.14c-8.658-2.286-17.605-5.996-26.835-11.14c-9.235-5.137-16.896-11.516-22.985-19.126
					c-6.09-7.614-11.088-17.61-14.987-29.979c-3.901-12.374-5.852-26.648-5.852-42.826c0-23.035,7.52-42.637,22.557-58.817
					c-7.044-17.318-6.379-36.732,1.997-58.24c5.52-1.715,13.706-0.428,24.554,3.853c10.85,4.283,18.794,7.952,23.84,10.994
					c5.046,3.041,9.089,5.618,12.135,7.708c17.705-4.947,35.976-7.421,54.818-7.421s37.117,2.474,54.823,7.421l10.849-6.849
					c7.419-4.57,16.18-8.758,26.262-12.565c10.088-3.805,17.802-4.853,23.134-3.138c8.562,21.509,9.325,40.922,2.279,58.24
					c15.036,16.18,22.559,35.787,22.559,58.817c0,16.178-1.958,30.497-5.853,42.966c-3.9,12.471-8.941,22.457-15.125,29.979
					c-6.191,7.521-13.901,13.85-23.131,18.986c-9.232,5.14-18.182,8.85-26.84,11.136c-8.662,2.286-18.415,4.004-29.263,5.146
					c9.894,8.562,14.842,22.077,14.842,40.539v60.237c0,3.422,1.19,6.279,3.572,8.562c2.379,2.279,6.136,2.95,11.276,1.995
					c44.163-14.653,80.185-41.062,108.068-79.226c27.88-38.161,41.825-81.126,41.825-128.906
					C438.536,184.851,428.728,148.168,409.132,114.573z"/>
			</svg>
		</a>
		<button id="open-file-button" class="center logo-button open-file-button" tabindex="0">Open Model&hellip;</button>
		<div class="center progress">
			<div id="progress-bar" class="progress-bar"></div>
		</div>
		<input type="file" id="open-file-dialog" class="open-file-dialog" multiple="false" accept="">
		<!-- Preload fonts to workaround Chrome SVG layout issue -->
		<div style="font-weight: normal; color: rgba(0, 0, 0, 0.01); user-select: none;">.</div>
		<div style="font-weight: bold; color: rgba(0, 0, 0, 0.01); user-select: none;">.</div>
		<div style="font-weight: bold; color: rgba(0, 0, 0, 0.01); user-select: none;">.</div>
	</div>
	<div id="message-dialog" class="center message-dialog">
		<span id="message-text" class="center message-text"></span>
		<button id="message-button" class="center logo-button message-button" tabindex="0">Accept</button>
	</div>
	<div id="titlebar" class="titlebar">
		<svg style="position: absolute; width: 0px; height: 0px; overflow: hidden;" aria-hidden="true">
			<symbol id="icon-arrow-right" viewBox="0 0 1024 1024">
				<path d="M698.75712 565.02272l-191.488 225.4848a81.73568 81.73568 0 0 1-62.48448 28.89728 81.89952 81.89952 0 0 1-62.40256-134.94272l146.432-172.4416-146.432-172.4416a81.92 81.92 0 0 1 124.88704-106.06592l191.488 225.4848a81.87904 81.87904 0 0 1 0 106.02496z"></path>
			</symbol>
		</svg>
		<div id="titlebar-content" class="titlebar-content">
			<span id="titlebar-content-text" class="titlebar-content-text"></span>
		</div>
		<div id="titlebar-control-box" class="titlebar-control-box">
			<div id="titlebar-close" class="titlebar-button titlebar-button-close" title="Close">
				<svg class="titlebar-icon" aria-hidden="true">
					<path d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z"></path>
				</svg>
			</div>
			<div id="titlebar-toggle" class="titlebar-button" title="Maximize">
				<svg id="titlebar-maximize" class="titlebar-icon" aria-hidden="true" style="position: absolute;">
					<path d="M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z"></path>
				</svg>
				<svg id="titlebar-restore" class="titlebar-icon" aria-hidden="true" style="position: absolute;">
					<path d="m 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z"></path>
				</svg>
			</div>
			<div id="titlebar-minimize" class="titlebar-button" title="Minimize">
				<svg class="titlebar-icon" aria-hidden="true">
					<path d="M 0,5 10,5 10,6 0,6 Z"></path>
				</svg>
			</div>
		</div>
	</div>
	<div id="menu" class="menu"></div>
	<div id="menu-button" class="menu-button">&#8801;</div>
	<script type="module" nonce="${nonce}">
		import {BrowserHost} from "${browserUri}";
		import {View} from "${viewUri}";

		const vscode = acquireVsCodeApi();
		
		var host = new BrowserHost();
		window.__view__ = new View(host);
		window.__view__.start();

		function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
		}
		async function docReady(fn)
		{
			while (document.body.className != "welcome")
			{
				await sleep(1);
			};
			fn();
		}
		
		docReady(function(){

			window.__view__._host._view.show('welcome spinner');
			vscode.postMessage({command: 'request_model'});

			window.addEventListener('message', event => {
				const message = event.data; // The JSON data our extension sent
		
				switch (message.command) {
					case 'transmit_model':
						const file1 = new File([Uint8Array.from(message.value)], "%GRAPHNAME%", {type: ''});
						window.__view__._host._open(file1, [file1]);
						break;
				}
					
			});
		});
		
	</script>
	</body>
	</html>`;
}


export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('vscode-netron.open', (resource: vscode.Uri) => {

			const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'webview', 'index.html'));
			// let html = fs.readFileSync(indexPath.fsPath, 'utf8');

			let modelFile = vscode.window.activeTextEditor?.document.fileName;
			if (resource !== undefined)
			{
				modelFile = resource.fsPath;
			}
			let baseName = path.basename(modelFile!);

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
			const iconUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'icon.png'));
			const faviconUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'favicon.ico'));
			const grapherSheetUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'grapher.css'));
			const viewUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'view.js'));
			const browserUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'netron', 'browser.js'));


			// // Replace ${variables} in html by URI values
			// html = html.replace(/cspSource/g, panel.webview.cspSource.toString());
			// html = html.replace('iconFilePath', iconUri.toString());
			// html = html.replace('faviconFilePath', faviconUri.toString());
			// html = html.replace('grapherSheetFilePath', grapherSheetUri.toString());
			// html = html.replace('viewFilePath', viewUri.toString());
			// html = html.replace('browserFilePath', browserUri.toString());
			
			// // Use a nonce to only allow specific scripts to be run
			// html = html.replace('nonceValue', getNonce());

			// panel.webview.html = html;
			let html = getHtmlForWebview(context, panel.webview);

			html = html.replace('%GRAPHNAME%', baseName);
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