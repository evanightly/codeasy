export type FastApiOutput =
    | {
          type: 'text';
          content: string;
      }
    | {
          type: 'image';
          content: string;
          is_temporary?: boolean;
      }
    | {
          type: 'error';
          content: string;
      }
    | {
          type: 'test_stats';
          total_tests: number;
          success: number;
          fail: number;
      }
    | {
          type: 'test_result';
          status: 'passed' | 'failed';
          content: string;
      };
