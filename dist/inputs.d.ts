export interface ActionInputs {
    apiKey: string;
    url: string;
    method: string;
    threshold: number | undefined;
    comment: boolean;
    baseUrl: string | undefined;
}
export declare function parseInputs(): ActionInputs;
