<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CognitiveLevelsClassificationProgressEvent implements ShouldBroadcastNow {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $courseId,
        public string $message,
        public int $currentStep,
        public int $totalSteps,
        public string $phase, // 'material' or 'course'
        public ?array $data = null
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): Channel {
        return new Channel('cognitive-levels-classification-progress');
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array {
        return [
            'course_id' => $this->courseId,
            'message' => $this->message,
            'current_step' => $this->currentStep,
            'total_steps' => $this->totalSteps,
            'progress_percentage' => round(($this->currentStep / $this->totalSteps) * 100, 2),
            'phase' => $this->phase,
            'data' => $this->data,
            'timestamp' => now()->toISOString(),
        ];
    }
}
