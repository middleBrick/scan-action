export interface ActionInputs {
    apiKey: string;
    url: string;
    method: string;
    headers: Record<string, string> | undefined;
    threshold: number | undefined;
    comment: boolean;
    baseUrl: string | undefined;
}
export declare function parseInputs(): ActionInputs;
