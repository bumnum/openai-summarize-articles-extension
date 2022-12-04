import "emoji-log";
import { browser } from "webextension-polyfill-ts";
import {
  BackgroundScriptMessage,
  ContentScriptMessage,
  MessageListener,
  Messenger,
} from "../util/Messenger";
import { Article } from "../util/Article";
import { Configuration, defaultConfig } from "../util/Configuration";

let config: Configuration = defaultConfig;

browser.runtime.onInstalled.addListener((): void => {
  console.emoji("🦄", "extension installed");
});

browser.storage.onChanged.addListener(async () => {
  config = {
    ...defaultConfig,
    ...((await browser.storage.sync.get()) as Promise<Configuration>),
  };
});

class Background {
  requests = new Map<BackgroundScriptMessage, MessageListener>();

  onRequestPotentialArticles: MessageListener = async () => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    const articles = await Promise.all(
      tabs
        .filter((tab) => typeof tab.id === "number")
        .map((tab) =>
          this.requestPotentialArticlesFromContent(tab.id!).catch((error) => {
            console.error("error requesting from content", tab, error);
            return [];
          })
        )
    );

    return { articles: articles.flat().filter((article) => article !== null) };
  };

  onSummarizeArticle: MessageListener = async (_sender, data: Article) => {
    return await summarizeString(data.text);
  };
  onHighlightArticle: MessageListener = async (_sender, article: Article) => {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    tabs
      .filter((tab) => typeof tab.id === "number")
      .forEach((tab) => this.highlightArticle(tab.id!, article));
  };

  async highlightArticle(tabId: number, article: Article) {
    return await Messenger.sendMessageToContentScript(
      tabId,
      ContentScriptMessage.HIGHLIGHT_ARTICLE,
      article
    );
  }

  async requestPotentialArticlesFromContent(tabID: number) {
    return await Messenger.sendMessageToContentScript(
      tabID,
      ContentScriptMessage.REQUEST_POTENTIAL_ARTICLES
    );
  }

  registerMessengerRequests() {
    this.requests.set(
      BackgroundScriptMessage.REQUEST_POTENTIAL_ARTICLES,
      this.onRequestPotentialArticles
    );
    this.requests.set(
      BackgroundScriptMessage.SUMMARIZE_ARTICLE,
      this.onSummarizeArticle
    );
    this.requests.set(
      BackgroundScriptMessage.HIGHLIGHT_ARTICLE,
      this.onHighlightArticle
    );
  }

  listenForMessages() {
    browser.runtime.onMessage.addListener((message, sender) => {
      const { type, data } = message;
      return this.requests.get(type)?.(sender, data);
    });
  }

  async init() {
    // 1. Create a mapping for message listeners
    this.registerMessengerRequests();

    // 2. Listen for messages from background and run the listener from the map
    this.listenForMessages();

    browser.tabs.onUpdated.addListener(async (_id, _changeInfo, tab) => {
      if (typeof tab.id !== "number") return;

      const articles = await this.requestPotentialArticlesFromContent(tab.id);
      if (!articles.length) return;

      browser.browserAction.setBadgeText({
        text: `${articles.length}`,
        tabId: tab.id,
      });
    });

    config = {
      ...defaultConfig,
      ...((await browser.storage.sync.get()) as Promise<Configuration>),
    };
  }
}

new Background().init();

interface CompletionsResponse {
  choices: {
    finish_reason: string;
    text: string;
  }[];
}

const summarizeString = async (text: string) => {
  const prompt = buildPrompt(text);

  console.log(prompt);

  const resp = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.api_key}`,
    },
    body: JSON.stringify({
      prompt,
      model: config.model,
      max_tokens: config.max_tokens,
      temperature: config.temperature
    }),
  });

  if (!resp.ok) {
    console.error(`Couldn't do OpenAI completion request`, resp.status);
    return;
  }

  const json: CompletionsResponse = await resp.json();

  const [choice] = json.choices;
  if (!choice) return;

  console.log("summary response", json);

  return choice.text.trim();
};

const buildPrompt = (text: string): string => {
  return config.prompt.replace(/(\$\{text})/, text);
};
