import $ from 'jquery';
import { messageHandler } from '@/core/message';
import { _browser } from '@/core/utils';
import browserDetect from 'browser-detect';

function sendResponseMessage(request: any, sender: any, sendResponse: any, res: any) {
    if (sender.tab && request.__message_id__) {
        res.__message_id__ = request.__message_id__;
        if (sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, res);
        }
    } else {
        console.log(res);
        sendResponse(res);
    }
}

messageHandler.handle({ cmd: "user.check" });

let result = browserDetect();
switch (result.name) {
    case "firefox":
    case "edge": {
        browser.runtime.onMessage.addListener((message: any, sender: browser.runtime.MessageSender, sendResponse: (response?: any) => boolean | void | Promise<any>) => {
            messageHandler.handle(message)!.done((data:any) => {
                sendResponse(data);
            });

            return true;
        });
        break;
    }
    default: {
        chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
            var result = messageHandler.handle(message);

            result!.done((data: any) => {
                sendResponse(data);
            });

            return true;
        });
    }
}