// noinspection JSUnusedGlobalSymbols

export {} // Make this a module

// This allows TypeScript to pick our custom API
declare global {
    namespace versions {
        /**
         * The version of Node.js
         */
        function node(): string

        /**
         * The version of Chrome
         */
        function chrome(): string

        /**
         * The version of Electron
         */
        function electron(): string
    }

    namespace electron {
        /**
         * Display information structure
         */
        interface Display {
            /**
             * The unique identifier of the display (for internal use)
             */
            id: string

            /**
             * The name of the display (use this for identification and user-facing purposes)
             */
            label: string

            /**
             * The bounds of the display (in pixels)
             */
            bounds: {
                x: number
                y: number
                width: number
                height: number
            },

            /**
             * The work area of the display in DIP points.
             */
            workArea: {
                x: number
                y: number
                width: number
                height: number
            },

            /**
             * The size of the display.
             */
            size: {
                width: number
                height: number
            }

            /**
             * The work area size of the display (in pixels)
             */
            workAreaSize: {
                width: number
                height: number
            }

            /**
             * The scale factor of the display
             */
            scaleFactor: number

            /**
             * The rotation of the display (in degrees)
             */
            rotation: number
        }

        /**
         * Oauth2 token structure (mostly via Authorization Code Grant with PKCE)
         */
        interface Oauth2Token {
            token_type: string
            expires_in: number
            access_token: string
            refresh_token: string | null
            expires_at: string
        }

        /**
         * The user object from the id.stream.tv API
         */
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

        /**
         * JSON schema for the `desktop.json` (settings) file
         */
        interface Settings {
            /**
             * The version of the settings schema (diff will force a reset)
             */
            version?: string

            /**
             * The user credentials for the application
             */
            credentials?: Own3dCredentials | null

            /**
             * Whether the application should launch with OBS
             */
            launch_with_obs?: boolean

            /**
             * Whether the developer mode is enabled
             */
            developer_mode?: boolean

            /**
             * Whether the overlay is disabled
             */
            overlay_disabled?: boolean

            /**
             * Whether the overlay is muted
             */
            overlay_muted?: boolean

            /**
             * Global hotkeys for the application
             */
            hotkeys?: {
                exit: string
            }

            /**
             * The display to use for the overlay
             */
            display?: Display | null

            /**
             * The room identifier for the overlay
             */
            room?: string | null
        }

        /**
         * Verified game structure (from the own3d.pro API)
         */
        interface VerifiedGame {
            /**
             * The unique identifier of the game
             */
            id: number

            /**
             * The name of the game
             */
            name: string

            /**
             * The publisher of the game (if available)
             */
            publisher: string | null

            /**
             * Additional setup notes for the game (if available)
             */
            notes: string | null

            /**
             * Whether the game is supported by the overlay
             */
            supported: boolean

            /**
             * Whether the game requires optimization (setting changes)
             */
            requires_optimization: boolean

            /**
             * List of executable names for the game
             */
            executables: Array<string>

            /**
             * The URL to the game's logo (if available)
             */
            image_url: string | null
        }

        /**
         * Returns the preload script path which can be used in the webview
         *
         * @example
         * ```typescript
         * webview.setAttribute('preload', `file://${await window.electron.preload()}`)
         * ```
         */
        function preload(): Promise<void>

        /**
         * Check if the application needs to open the dev tools
         */
        function needsDevTools(): Promise<void>

        /**
         * Get the hostname of the own3d.pro dashboard (for the webview)
         *
         * @example
         * ```typescript
         * const hostname = await window.electron.getHostname()
         * webview.setAttribute('src', `${hostname}/`)
         * ```
         */
        function getHostname(): Promise<void>

        /**
         * Get the current settings of the application
         */
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
         * Listen for changes to the settings
         *
         * @param callback - The callback to call when the settings change
         */
        function onSettingsChanged(callback: (settings: Settings) => void): void

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
         * Listen for changes to the list of currently played games
         *
         * @param callback - The callback to call when the list of games change
         */
        function onGamesChanged(callback: (games: Array<VerifiedGame>) => void): void

        /**
         * Get the list of connected displays
         */
        function getDisplays(): Promise<Array<Display>>

        /**
         * Updates the display bounds for the overlay window based on user settings or default display settings
         */
        function requestDisplayUpdate(): Promise<void>

        /**
         * API to interact with the desktop client (window management, authentication, etc.)
         */
        namespace desktop {
            /**
             * Authorization data structure (from the own3d.pro dashboard)
             *
             * @deprecated This will be replaced by the `magicLogin` flow
             */
            interface Authorization {
                data: unknown
                locale: string
                token: string
            }
            
            interface OpenDialogReturnValue {
                /**
                 * whether or not the dialog was canceled.
                 */
                canceled: boolean;
                /**
                 * An array of file paths chosen by the user. If the dialog is cancelled this will
                 * be an empty array.
                 */
                filePaths: string[];
                /**
                 * An array matching the `filePaths` array of base64 encoded strings which contains
                 * security scoped bookmark data. `securityScopedBookmarks` must be enabled for
                 * this to be populated. (For return values, see table here.)
                 *
                 * @platform darwin,mas
                 */
                bookmarks?: string[];
            }

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
             * Check if the main window is maximized
             */
            function isMaximized(): Promise<boolean>

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
             *
             * Our desktop client will open the default browser with the magic link
             * and wait for the user to authenticate. Once the user is authenticated,
             * the browser will redirect to the desktop client with the access token.
             *
             * In case of a Timeout, the user shall be informed that they may need
             * to try again. Avoid re-calling this function automatically.
             *
             * @returns The access token from the magic link flow
             *
             * @throws Error If the URL is not authorized within 2 minutes (timeout)
             *
             * @example
             * ```
             * const {access_token} = await window.electron.desktop.magicLogin();
             * ```
             */
            function magicLogin(): Promise<{ access_token: string }>

            /**
             * Log the user out of the application
             *
             * This function behaves like `clearCache()` but also logs the user out
             */
            function logout(): void

            /**
             * Opens a system native file dialog
             * 
             * This function proxies the showOpenDialog function from electron
             * 
             * @param options An optional object with options for showOpenDialog
             */
            function openFileDialog(options: any): Promise<OpenDialogReturnValue>
        }

        /**
         * Beta API to interact with software packages
         */
        namespace software {
            /**
             * Name of the software package
             */
            type SoftwareName = 'obs-studio' | 'obs-own3d-desktop-connector';

            /**
             * Software package information
             */
            interface Software {
                installed: boolean;
                name: SoftwareName;
                paths?: {
                    binary: string;
                    plugins?: string;
                };
            }

            /**
             * Installation progress information
             */
            interface InstallProgress {
                status: 'downloading' | 'installing';
                progress: number;
                status_code?: number;
            }

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

        /**
         * API (proxy) to interact with obs-websocket
         */
        namespace obs {
            /**
             * obs-websocket request batch options
             */
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

            /**
             * obs-websocket request batch execution type
             */
            enum RequestBatchExecutionType {
                None = -1,
                SerialRealtime = 0,
                SerialFrame = 1,
                Parallel = 2
            }

            /**
             * obs-websocket request batch request
             */
            type RequestBatchRequest<T = keyof unknown> = T extends keyof unknown ? unknown[T] extends never ? {
                requestType: T;
                requestId?: string;
            } : {
                requestType: T;
                requestId?: string;
                requestData: unknown[T];
            } : never;

            /**
             * obs-websocket response message
             */
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
             * Check if the client is connected to obs-websocket
             */
            function connected(): Promise<boolean>

            /**
             * Tries to detect and store OBS websocket credentials from well known paths
             * 
             * Optionally looks in config paths of a portable OBS Studio installation
             * 
             * @param pathToBinary An path to a portable OBS Studio binary (e.g. obs64.exe)
             */
            function findAndStoreCredentials(pathToBinary?: string): Promise<boolean>

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
             * Enable the obs-websocket server on the local machine.
             *
             * @throws Error If obs-websocket could not be enabled
             */
            function enableWebSocketServer(options?: object): Promise<void>

            /**
             * Check if the obs-websocket server is enabled on the local machine.
             *
             * @throws Error If obs-websocket is not installed
             */
            function isWebSocketServerEnabled(): Promise<boolean>

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
