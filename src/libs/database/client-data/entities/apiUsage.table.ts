export interface ApiUsageTable {
    id: number;
    client_ip: number;
    country: string;
    user_agent: string;
    device_id: string;
    request_count: number;
    rate_limit_quota: number;
}
