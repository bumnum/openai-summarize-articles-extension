// Messenger.ts
import { browser, Runtime } from "webextension-polyfill-ts";

export enum ContentScriptMessage {
  REQUEST_POTENTIAL_ARTICLES = "REQUEST_POTENTIAL_ARTICLES",
  FOUND_POTENTIAL_ARTICLES = "FOUND_POTENTIAL_ARTICLES",
  HIGHLIGHT_ARTICLE = "HIGHLIGHT_ARTICLE",
}

export enum BackgroundScriptMessage {
  REQUEST_POTENTIAL_ARTICLES = "REQUEST_POTENTIAL_ARTICLES",
  FOUND_POTENTIAL_ARTICLES = "FOUND_POTENTIAL_ARTICLES",
  SUMMARIZE_ARTICLE = "SUMMARIZE_ARTICLE",
  HIGHLIGHT_ARTICLE = "HIGHLIGHT_ARTICLE",
}

export const Messenger = {
  /**
   * Send a message to Background script
   *
   * @param {BackgroundMessage} type Background Message Type
   * @param {*} [data=null]
   * @return {*}
   */
  async sendMessageToBackground(
    type: BackgroundScriptMessage,
    data: any = null
  ) {
    try {
      return await browser.runtime.sendMessage({ type, data });
    } catch (error) {
      console.error("sendMessageToBackground error: ", error);
      return null;
    }
  },

  /**
   * Send a message to Content Script of a Tab
   *
   * @param {number} tabID Tab ID
   * @param {ContentScriptMessage} type
   * @param {*} [data=null]
   * @return {*}
   */
  async sendMessageToContentScript(
    tabID: number,
    type: ContentScriptMessage,
    data: any = null
  ) {
    try {
      console.log(`[>>> cs] ${type} - ${data}`);
      // Notice the API difference - browser.tabs to send to content script but browser.runtime to send to background.
      const response = await browser.tabs.sendMessage(tabID, { type, data });
      console.log("response:", response);
      return response;
    } catch (error) {
      console.error("sendMessageToContentScript error: ", error);
      return null;
    }
  },
};

export type IMessage<T> = {
  type: ContentScriptMessage | BackgroundScriptMessage;
  data: T;
};

export type MessageListener = (sender: Runtime.MessageSender, data: any) => any;
