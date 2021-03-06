import { Middleware, MiddlewareAPI, Dispatch, Action } from 'redux';

import SocketService from './socketService';

export const serviceInstance = new SocketService(process.env.SERVER_URL);

export function createSocketMiddleware(): Middleware {
  return ({ dispatch }: MiddlewareAPI) => {
    serviceInstance.init();
    serviceInstance.subscribe(dispatch);

    return (next: Dispatch) => (action: Action) => {
      const isIntercepted = serviceInstance.interceptAction(action);

      if (isIntercepted) return;

      return next(action);
    };
  };
}
