import * as React from "react";

import "./styles.scss";
import { FormEvent, useEffect, useReducer, useRef } from "react";
import { browser } from "webextension-polyfill-ts";
import { Configuration, defaultConfig } from "../util/Configuration";

const Options: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, dispatch] = useReducer(
    (state: Configuration, action: Partial<Configuration>) => {
      return { ...state, ...action };
    },
    defaultConfig
  );

  // @ts-ignore
  useEffect(async () => {
    const config = await browser.storage.sync.get();

    dispatch({
      ...defaultConfig,
      ...config,
    });
  }, []);

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();

    if (!formRef.current) return;

    browser.storage.sync.set(state);
  };

  return (
    <div className="p-5">
      <div className="font-bold text-2xl uppercase pt-6 mb-4">
        OpenAI summary extension
      </div>

      <div className="mb-4">
        This is more a weekend proof of concept so please don't use it for
        something serious.
        <br />
        Here be dragons.
        <br />
        Source is available{" "}
        <a className="underline" href="#">
          on github
        </a>
        .
      </div>

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="api_key"
          >
            Your OpenAI API key
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={state.api_key}
            onChange={(ev) => dispatch({ api_key: ev.target.value })}
            type="password"
            id="api_key"
            name="api_key"
            spellCheck="false"
            autoComplete="off"
            required
          />
          <div className="mt-2">
            See more about api keys in the official openai settings:{" "}
            <a
              className="underline"
              href="https://beta.openai.com/account/api-keys"
            >
              https://beta.openai.com/account/api-keys
            </a>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="max_tokens"
          >
            Max tokens
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={state.max_tokens}
            onChange={(ev) =>
              dispatch({ max_tokens: parseInt(ev.target.value, 10) })
            }
            type="text"
            id="max_tokens"
            name="max_tokens"
            spellCheck="false"
            autoComplete="off"
            required
          />
          <div className="mt-2">
            See{" "}
            <a
              className="underline"
              href="https://beta.openai.com/docs/api-reference/completions/create#completions/create-max_tokens"
            >
              max_tokens
            </a>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="temperature"
          >
            Temperature
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={state.temperature}
            onChange={(ev) =>
              dispatch({ temperature: parseFloat(ev.target.value) })
            }
            type="text"
            id="temperature"
            name="temperature"
            spellCheck="false"
            autoComplete="off"
            required
          />
          <div className="mt-2">
            See{" "}
            <a
              className="underline"
              href="https://beta.openai.com/docs/api-reference/completions/create#completions/create-temperature"
            >
              temperature
            </a>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="model"
          >
            Model
          </label>
          <select
            className="shadow bg-white border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={state.model}
            onChange={(ev) => dispatch({ model: ev.target.value })}
            name="model"
            id="model"
            required
          >
            <option value="text-davinci-003">text-davinci-003</option>
            <option value="text-curie-001">text-curie-001</option>
            <option value="text-babbage-001">text-babbage-001</option>
            <option value="text-ada-001">text-ada-001</option>
          </select>

          <div className="mt-2">
            See{" "}
            <a
              className="underline"
              href="https://beta.openai.com/docs/models/gpt-3"
              target="_blank"
            >
              openai.com/docs/models/overview
            </a>
          </div>
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="model"
          >
            Prompt template
          </label>
          <textarea
            rows={5}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={state.prompt}
            onChange={(ev) => dispatch({ prompt: ev.target.value.trim() })}
            name="model"
            id="model"
            required
          ></textarea>

          <div className="mt-2">
            See{" "}
            <a
              className="underline"
              href="https://beta.openai.com/docs/api-reference/completions/create#completions/create-prompt"
              target="_blank"
            >
              prompt
            </a>
          </div>
        </div>

        <button
          className="bg-blue-500 uppercase hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          save
        </button>
      </form>
    </div>
  );
};

export default Options;
