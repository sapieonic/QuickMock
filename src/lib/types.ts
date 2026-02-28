export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export interface Mock {
  id: number;
  name: string;
  route_path: string;
  method: HttpMethod;
  request_headers: string | null;
  query_params: string | null;
  response_status_code: number;
  response_headers: string | null;
  response_body: string | null;
  is_active: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MockInput {
  name: string;
  route_path: string;
  method: HttpMethod;
  request_headers?: string | null;
  query_params?: string | null;
  response_status_code?: number;
  response_headers?: string | null;
  response_body?: string | null;
  is_active?: boolean;
}
