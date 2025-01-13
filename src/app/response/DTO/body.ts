export class BodyResponseDTO {
  constructor(
    public message?: string,
    public code?: number,
    public data?: unknown
  ) {
    this.message = message ?? ''
    this.code = code ?? NaN
    this.data = data ?? ''
  }
}
