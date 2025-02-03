<?php

namespace App\Traits\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Exceptions\Repository\RepositoryException;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;

trait HandlesPageSizeAll {
    /**
     * @throws RepositoryException
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     */
    public function handlePageSizeAll(): void {
        if (request()->get('page_size') === 'all') {
            request()->merge(['page_size' => $this->repository->count()]);
        }
    }
}
