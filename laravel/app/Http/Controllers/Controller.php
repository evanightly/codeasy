<?php

namespace App\Http\Controllers;

abstract class Controller {
    protected function ajax(): bool {
        return !request()->inertia() && request()->expectsJson();
    }
}
