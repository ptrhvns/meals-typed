// import useAuthn from "./useAuthn"; // TODO
// import { useNavigate } from "react-router-dom"; // TODO
import Cookies from "js-cookie";
import { isEmpty, omit } from "lodash";
import { useCallback } from "react";

// This helper function ensures that TypeScript can infer the type of the key as
// a union of all of the keys in the given object literal, but that the type of
// the value is expressed concretely. This will help us later to prevent the use
// of invalid routes.
const asRouteDictionary = <T>(dictionary: {
  [K in keyof T]: (routeData?: object) => string;
}) => dictionary;

// istanbul ignore next
// prettier-ignore
const API_ROUTES = asRouteDictionary({
  csrfToken: () => "/api/csrf_token/",
  signup: () => "/api/signup/",
});

// istanbul ignore next
// prettier-ignore
// TODO
// const WEB_ROUTES = asRouteDictionary({
//  login: () => '/login'
// });

interface ApiArguments {
  data?: object;
  headers_init?: object;
  method: string;
  route: keyof typeof API_ROUTES; // Prevent the use of invalid routes.
}

export interface ApiResponse {
  data?: object;
  errors?: { [key: string]: string[] };
  isError?: boolean;
  message?: string;
}

interface UseApiReturn {
  get: (args: Omit<ApiArguments, "method">) => Promise<ApiResponse>;
  post: (args: Omit<ApiArguments, "method">) => Promise<ApiResponse>;
  send: (args: ApiArguments) => Promise<ApiResponse>;
}

const DEFAULT_HEADERS_INIT = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function getJson(res: Response): Promise<object> {
  const text = await res.text();
  return isEmpty(text) ? {} : await JSON.parse(text);
}

export function useApi(): UseApiReturn {
  // const navigate = useNavigate(); // TODO
  // const { logout } = useAuthn(); // TODO

  const send = useCallback(
    async ({
      data,
      headers_init,
      method,
      route,
    }: ApiArguments): Promise<ApiResponse> => {
      let body: string | null;

      try {
        body = data ? JSON.stringify(data) : null;
      } catch (error) {
        return {
          isError: true,
          message: "Your request could not be properly formatted.",
        };
      }

      const headers = new Headers({
        ...DEFAULT_HEADERS_INIT,
        ...headers_init,
      });

      const mode = "same-origin";

      let url: string;

      try {
        url = API_ROUTES[route]();
      } catch (error) {
        return {
          isError: true,
          message: "We tried to send your request to an unknown location.",
        };
      }

      let response: Response;

      try {
        response = await fetch(url, { body, headers, method, mode });
      } catch (error) {
        return {
          isError: true,
          message: "Your request could not be sent.",
        };
      }

      if (
        !response.ok &&
        (response.status === 401 || response.status === 403)
      ) {
        // TODO
        // logout(() => navigate(WEB_ROUTES.login()));
        return {
          isError: true,
          message: "Your request was not authorized. Try logging in.",
        };
      }

      let json: { message?: string } = {};

      if (!response.ok) {
        try {
          json = await getJson(response);
        } catch (error) {
          json = {};
        }

        return {
          isError: true,
          message: json.message ?? "The response to your request was an error.",
          ...omit(json, "message"),
        };
      }

      try {
        json = await getJson(response);
      } catch (error) {
        return {
          isError: true,
          message: "The response to your request was in an invalid format.",
        };
      }

      return json || {};
    },
    []
  );

  const get = useCallback(
    ({ ...args }: Omit<ApiArguments, "method">): Promise<ApiResponse> =>
      send({ method: "GET", ...args }),
    [send]
  );

  const post = useCallback(
    async ({ ...args }: Omit<ApiArguments, "method">): Promise<ApiResponse> => {
      // API requires a valid CSRF token to process a POST request. Calling get
      // on this route has the side effect of setting that token.
      await get({ route: "csrfToken" });

      return send({
        headers_init: {
          "X-CSRFToken": Cookies.get("csrftoken"),
          ...args.headers_init,
        },
        method: "POST",
        ...omit(args, "headers"),
      });
    },
    [get, send]
  );

  return { get, post, send };
}