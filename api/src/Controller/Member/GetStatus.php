<?php declare(strict_types=1);
/*.
    require_module 'standard';
.*/

namespace App\Controller\Member;

use Slim\Http\Request;
use Slim\Http\Response;

class GetStatus extends BaseMember
{


    public function buildResource(Request $request, Response $response, $args): array
    {
        $data = \lookup_users_by_key($args['name']);
        if (empty($data['users'])) {
            if (empty($data['error'])) {
                $error = 'No Members Found';
            } else {
                $error = $data['error'];
            }
            return [
            \App\Controller\BaseController::RESULT_TYPE,
            $this->errorResponse($request, $response, $error, 'Not Found', 404)];
        }
        if (count($data['users']) > 1) {
            $error = 'Too many matches found';
            return [
            \App\Controller\BaseController::RESULT_TYPE,
            $this->errorResponse($request, $response, $error, 'Not Found', 404)];
        }
        $data = $data['users'][0];
        $valid = array('type' => 'member_status',
                       'status' => \verify_account($data['Id']));
        return [
        \App\Controller\BaseController::RESOURCE_TYPE,
        $valid];

    }


    /* end GetStatus */
}