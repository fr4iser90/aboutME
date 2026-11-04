/**
 * Legacy markdown build converter — stub.
 * Original module missing; kept so /api/editor/build does not crash Turbopack.
 * JSON-first publish path (/api/setup/publish) is the real pipeline.
 */
export class MarkdownConverter {
  async convertAll(): Promise<{
    success: boolean;
    message: string;
    converted: number;
  }> {
    return {
      success: false,
      message:
        'MarkdownConverter is deprecated. Use JSON content + /api/setup/publish instead.',
      converted: 0,
    };
  }
}
