import { ContentScriptMessage } from "../util/Messenger";
import { browser } from "webextension-polyfill-ts";
import { Article } from "../util/Article";

console.log("helloworld from content script");

function uuidv4() {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

const articleMap = new Map<string, HTMLElement>();

const removeElements = (root: HTMLElement, selector: string) =>
  Array.from(root.querySelectorAll(selector)).forEach((el) => el.remove());

const normalizeArticle = (element: HTMLElement) => {
  const clone = element.cloneNode(true) as HTMLElement;
  removeElements(clone, "time");
  removeElements(clone, "nav");
  removeElements(clone, "figcaption");
  return clone;
};

class ContentScript {
  requests = new Map();

  requestPotentialMessages = async (
    sender: any,
    data: any
  ): Promise<Article[]> => {
    console.log(
      `receiveHelloFromBackground: requestPotentialMessages `,
      sender,
      data
    );

    const articles = Array.from(document.querySelectorAll("article"))
      .map((element) => {
        // it's "hidden"
        if (!element.offsetParent) return;

        const normalized = normalizeArticle(element);
        document.body.appendChild(normalized)
        const text = normalized.innerText.trim();
        normalized.remove();

        if (text.length < 500) return;

        const id = uuidv4();
        articleMap.set(id, element);

        return { id, text, origin: location.origin };
      })
      .filter((result): result is Article => result !== undefined);

    console.log("found articles", articles);

    return articles;
  };

  onHighlightArticle = async (_sender: any, article: Article) => {
    console.log(`onHighlightArticle`, article);
    const element = articleMap.get(article.id);
    element?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  };

  // async postPotentialArticlesToBackground() {
  //   const response = await Messenger.sendMessageToBackground(
  //     BackgroundScriptMessage.REQUEST_POTENTIAL_ARTICLES,
  //     { message: "Hello Background!!!" }
  //   );
  //   console.log("Background Response: ", response);
  // }

  registerMessengerRequests() {
    this.requests.set(
      ContentScriptMessage.REQUEST_POTENTIAL_ARTICLES,
      this.requestPotentialMessages
    );
    this.requests.set(
      ContentScriptMessage.HIGHLIGHT_ARTICLE,
      this.onHighlightArticle
    );
  }

  listenForMessages() {
    browser.runtime.onMessage.addListener((message, sender) => {
      const { type, data } = message;
      return this.requests.get(type)(sender, data);
    });
  }

  init() {
    // 1. Create a mapping for message listeners
    this.registerMessengerRequests();

    // 2. Listen for messages from background and run the listener from the map
    this.listenForMessages();
  }
}

new ContentScript().init();

export {};
