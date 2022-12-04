import * as React from "react";
import { useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";

import "./styles.scss";
import { BackgroundScriptMessage, Messenger } from "../util/Messenger";
import { Article } from "../util/Article";
import Cached from "@mui/icons-material/Cached";
import SearchOff from "@mui/icons-material/SearchOff";
import Refresh from "@mui/icons-material/Refresh";
import Settings from "@mui/icons-material/Settings";

const Popup: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // @ts-ignore
  useEffect(async () => {
    const { articles }: { articles: Article[] } =
      await Messenger.sendMessageToBackground(
        BackgroundScriptMessage.REQUEST_POTENTIAL_ARTICLES
      );
    // TODO: sometimes there are null values in the returned list
    setArticles(articles.filter(Boolean));
  }, []);

  return (
    <section id="popup" className="relative flex flex-col">
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center text-xl	text-white">
          <div className="animate-spin w-20 h-20 flex items-center justify-center">
            <Refresh />
          </div>
        </div>
      )}

      <div className="bg-white p-2 flex shrink-0 items-center justify-between border border-b-solid border-b-neutral-300">
        <div className="text-xs">OpenAI summarize articles</div>
        <div className="space-x-2">
          <button
            type="button"
            title="Check for articles again"
            onClick={async () => {
              const { articles }: { articles: Article[] } =
                await Messenger.sendMessageToBackground(
                  BackgroundScriptMessage.REQUEST_POTENTIAL_ARTICLES
                );
              setArticles(articles);
            }}
          >
            <Cached />
          </button>
          <button
            type="button"
            title="Open settings"
            onClick={async () => {
              browser.tabs.create({
                url: "/options.html",
              });
            }}
          >
            <Settings />
          </button>
        </div>
      </div>

      <div className="p-4 grow flex flex-col">
        {articles.length > 0 ? (
          <>
            <ul>
              {articles.map((article) => (
                <li
                  className="mb-2 bg-white transition-shadow shadow hover:shadow-lg"
                  key={article.id}
                >
                  <div
                    className="p-2 cursor-pointer"
                    role="button"
                    onPointerEnter={async () => {
                      await Messenger.sendMessageToBackground(
                        BackgroundScriptMessage.HIGHLIGHT_ARTICLE,
                        article
                      );
                    }}
                    onClick={async () => {
                      setLoading(true);
                      article.summary = await Messenger.sendMessageToBackground(
                        BackgroundScriptMessage.SUMMARIZE_ARTICLE,
                        article
                      );
                      setArticles(articles);
                      setLoading(false);
                    }}
                  >
                    <div className="text-gray-500 text-xs truncate mb-1">
                      {article.origin}
                    </div>
                    <div className="text-gray-900 text-sm line-clamp-3">
                      {article.text.substring(0, 200)}
                    </div>
                  </div>
                  {article.summary && (
                    <div className="p-2 bg-slate-100 mt-2 text-sm whitespace-pre-line border-t border-solid border-t-slate-200">
                      {article.summary}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full grow">
            <SearchOff />
            <div className="text-center">
              No articles found.
              <br />
              Please try another website.
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Popup;
