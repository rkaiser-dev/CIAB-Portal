<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

/**
 *  @OA\Tag(
 *      name="administrative",
 *      description="Features around Administration of the site"
 *  )
 */

namespace App\Controller\System;

use Slim\Container;
use App\Controller\BaseController;

abstract class BaseSystem extends BaseController
{


    public function __construct(Container $container)
    {
        parent::__construct('system', $container);

    }


    public static function install($database): void
    {

    }


    public static function permissions($database): ?array
    {
        return ['api.get.log', 'api.get.configuration', 'api.put.log', 'api.put.configuration'];

    }


    /* End BaseSystem */
}
