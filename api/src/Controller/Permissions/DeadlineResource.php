<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

namespace App\Controller\Permissions;

use Slim\Http\Request;
use Slim\Http\Response;

use App\Controller\NotFoundException;

class DeadlineResource extends DeadlinePermission
{


    private function buildEntry($request, $id, $method): array
    {
        $path = $request->getUri()->getBaseUrl();
        $allowed = (\ciab\RBAC::havePermission('api.'.$method.'.deadline.'.$id) ||
                    \ciab\RBAC::havePermission('api.'.$method.'.deadline.all'));
        ;
        return $this->buildDeptEntry(
            $id,
            $allowed,
            'deadline',
            $method,
            [
            'method' => $method,
            'href' => $path.'/deadline/'.$id,
            'request' => strtoupper($method)
            ]
        );

    }


    public function buildResource(Request $request, Response $response, $args): array
    {
        global $Departments;

        $path = $request->getUri()->getBaseUrl();
        $result = array();
        $data = $this->getDepartment($args['department']);
        if ($data === null) {
            throw new NotFoundException('Department \''.$args['department'].'\' Invalid');
        }
        $id = $data['id'];
        $method = $args['method'];
        if ($method !== null && !in_array($method, DeadlinePermission::ALL_METHODS)) {
            throw new NotFoundException('Method \'deadline.'.$method.'\' Invalid');
        }
        if ($method !== null) {
            $result[] = $this->buildEntry($request, $id, $method);
        } else {
            foreach (DeadlinePermission::ALL_METHODS as $method) {
                $result[] = $this->buildEntry($request, $id, $method);
            }
        }
        return [
        \App\Controller\BaseController::LIST_TYPE,
        $result,
        array('type' => 'permission_list')];

    }


    /* end DeadlineResource */
}
