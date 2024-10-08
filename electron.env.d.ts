export {} // Make this a module

declare global {
    // This allows TypeScript to pick our custom API
    namespace electron {
        interface Authorization {
            data: unknown
            locale: string
            token: string
        }

        interface Display {
            id: string
            label: string
            bounds: {
                x: number
                y: number
                width: number
                height: number
            },
            workArea: {
                x: number
                y: number
                width: number
                height: number
            },
            size: {
                width: number
                height: number
            }
            workAreaSize: {
                width: number
                height: number
            }
            scaleFactor: number
            rotation: number
        }

        interface Oauth2Token {
            token_type: string
            expires_in: number
            access_token: string
            refresh_token: string | null
            expires_at: string
        }

        interface Own3dUser {
            id: string
            name: string
            avatar_url: string

            [key: string]: unknown
        }

        /**
         * Oauth2 credential structure including user information
         */
        interface Own3dCredentials extends Oauth2Token {
            user: Own3dUser
        }

        interface Settings {
            version?: string // version of the settings schema (diff will force a reset)
            credentials?: Own3dCredentials | null
            launch_with_obs?: boolean
            developer_mode?: boolean
            overlay_disabled?: boolean
            overlay_muted?: boolean
            hotkeys?: {
                exit: string
            }
            display?: Display | null
            room?: string | null
        }

        interface VerifiedGame {
            id: number
            name: string
            publisher: string | null
            notes: string | null
            supported: boolean
            requires_optimization: boolean
            executables: Array<string>
            image_url: string | null
        }

        type SoftwareName = 'obs-studio' | 'obs-own3d-desktop-connector';

        interface Software {
            installed: boolean;
            name: SoftwareName;
            paths?: {
                binary: string;
                plugins?: string;
            };
        }

        interface InstallProgress {
            status: 'downloading' | 'installing';
            progress: number;
            status_code?: number;
        }

        type RequestBatchOptions = {
            /**
             * The mode of execution obs-websocket will run the batch in
             */
            executionType?: RequestBatchExecutionType;
            /**
             * Whether obs-websocket should stop executing the batch if one request fails
             */
            haltOnFailure?: boolean;
        };

        enum RequestBatchExecutionType {
            None = -1,
            SerialRealtime = 0,
            SerialFrame = 1,
            Parallel = 2
        }

        type RequestBatchRequest<T = keyof unknown> = T extends keyof unknown ? unknown[T] extends never ? {
            requestType: T;
            requestId?: string;
        } : {
            requestType: T;
            requestId?: string;
            requestData: unknown[T];
        } : never;

        type ResponseMessage<T = keyof unknown> = T extends keyof unknown ? {
            requestType: T;
            requestId: string;
            requestStatus: {
                result: true;
                code: number;
            } | {
                result: false;
                code: number;
                comment: string;
            };
            responseData: unknown[T];
        } : never;

        /**
         * API to interact with the desktop client (window management, authentication, etc.)
         */
        namespace desktop {
            /**
             * Close the main window
             */
            function closeWindow(): void

            /**
             * Minimize the main window
             */
            function minimizeWindow(): void

            /**
             * Maximize the main window
             */
            function maximizeWindow(): void

            /**
             * Quit the entire application
             */
            function quit(): void

            /**
             * Authenticate the user with the given authorization data
             *
             * @param authorization - The authorization data to use
             *
             * @deprecated Use `magicLogin` instead
             */
            function authenticate(authorization: Authorization): void

            /**
             * Get the unique device identifier
             */
            function getDeviceId(): Promise<string>

            /**
             * Tries to authenticate the user using the magic link flow
             */
            function magicLogin(): Promise<{ access_token: string }>
        }

        /**
         * Beta API to interact with software packages
         */
        namespace software {
            /**
             * Get the status of a software package
             */
            function get(name: SoftwareName): Promise<Software>

            /**
             * Install a software package (requires admin privileges)
             * Throws an error if the software is not installable
             */
            function install(
                name: SoftwareName,
                progressCallback: (progress: InstallProgress) => void,
            ): Promise<Software>
        }

        function getSettings(): Promise<Settings>

        /**
         * Commit the settings to the file
         *
         * @param settings - The settings to commit
         *
         * @example
         * ```typescript
         * // get the current settings
         * const settings = await getSettings();
         *
         * // partial update
         * await commitSettings({launch_with_obs: !settings.launch_with_obs});
         *
         * // full update
         * settings.launch_with_obs = !settings.launch_with_obs;
         * await commitSettings(settings);
         * ```
         */
        function commitSettings(settings: Settings): Promise<void>

        /**
         * Clear the cache of the application.
         */
        function clearCache(): Promise<void>

        /**
         * Toggle the overlay visibility state
         */
        function toggleOverlay(): Promise<void>

        /**
         * Toggle the overlay audio state
         */
        function toggleOverlayAudio(): Promise<void>

        /**
         * Get the list of verified games
         */
        function getGames(): Promise<Array<VerifiedGame>>

        /**
         * Get the list of connected displays
         */
        function getDisplays(): Promise<Array<Display>>

        /**
         * Request an update of the display information
         */
        function requestDisplayUpdate(): Promise<void>

        /**
         * API (proxy) to interact with obs-websocket
         */
        namespace obs {
            /**
             * Check if the client is connected to obs-websocket
             */
            function connected(): Promise<boolean>

            /**
             * Connects to obs-websocket server.
             *
             * @param url - The URL to connect to. Defaults to ws://localhost:4444
             * @param password - The password to use when connecting
             * @param identificationParams - Additional parameters to send when connecting
             *
             * @example
             * ```typescript
             * // connect to obs-websocket running on localhost with same port
             * await obs.connect();
             *
             * // Connect to obs-ws running on 192.168.0.4
             * await obs.connect('ws://192.168.0.4:4455');
             *
             * // Connect to localhost with password
             * await obs.connect('ws://127.0.0.1:4455', 'super-sekret');
             * ```
             */
            function connect(url?: string, password?: string, identificationParams?: {}): Promise<any>

            /**
             * Disconnects from obs-websocket server. This keeps any registered event listeners.
             */
            function disconnect(): Promise<void>

            /**
             * Sending requests to obs-websocket is done via call method.
             *
             * @param requestType - The request type to send to obs-websocket
             * @param requestData - The data to send with the request
             *
             * @example
             * ```typescript
             * await obs.call('CreateSceneCollection', {
             *   sceneCollectionName: 'My Scene Collection',
             * });
             * ```
             */
            function call(requestType: string, requestData?: object): Promise<any>

            /**
             * Multiple requests can be batched together using the callBatch method.
             *
             * The full request list is sent over the socket at once, obs-websocket executes the requests based
             * on the options provided, then returns the full list of results once all have finished.
             *
             * @param requests - The list of requests to send to obs-websocket
             * @param options - The options to use when executing the batch
             *
             * @example
             * ```typescript
             * const results = await obs.callBatch([
             *   {requestType: 'CreateSceneCollection', requestData: {sceneCollectionName: 'My Scene Collection'}},
             *   {requestType: 'CreateScene', requestData: {sceneName: 'My Scene'}},
             * ]);
             * ```
             */
            function callBatch(requests: RequestBatchRequest[], options?: RequestBatchOptions): Promise<ResponseMessage[]>

            /**
             * Register an event listener for obs-websocket events.
             *
             * @param event - The event to listen for
             * @param handler - The function to call when the event is emitted
             */
            function on(event: string, handler: Function): void

            /**
             * Register an event listener for obs-websocket events that will only be called once.
             *
             * @param event - The event to listen for
             * @param handler - The function to call when the event is emitted
             */
            function once(event: string, handler: Function): void

            /**
             * Remove an event listener for obs-websocket events.
             *
             * @param event - The event to remove the listener from
             * @param handler - The function to remove from the event
             */
            function off(event: string, handler: Function): void

            /**
             * Register an event listener for obs-websocket events.
             *
             * @param event - The event to listen for
             * @param handler - The function to call when the event is emitted
             */
            function addListener(event: string, handler: Function): void

            /**
             * Remove an event listener for obs-websocket events.
             *
             * @param event - The event to remove the listener from
             * @param handler - The function to remove from the event
             */
            function removeListener(event: string, handler: Function): void
        }
    }
}
