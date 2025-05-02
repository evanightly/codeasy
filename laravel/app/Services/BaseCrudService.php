<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService as AdobrovolskyBaseCrudService;
use App\Support\Interfaces\Repositories\BaseRepositoryInterface;
use App\Support\Interfaces\Services\BaseCrudServiceInterface;
use Illuminate\Database\Eloquent\Model;

class BaseCrudService extends AdobrovolskyBaseCrudService implements BaseCrudServiceInterface {
    /**
     * @var BaseRepositoryInterface
     */
    public $repositoryClass;

    /**
     * @var Model
     */
    public $modelClass;

    /**
     * BaseCrudService constructor.
     */
    public function __construct() {
        $this->repositoryClass = app($this->getRepositoryClass());
        $this->modelClass = app($this->getRepositoryClass())->modelClass;
        parent::__construct();
    }

    protected function getRepositoryClass(): string {
        return $this->getRepositoryClass();
    }
}
