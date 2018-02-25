<?php

function output_cvs($report, $filename)
{
    header("Content-Type: application/CSV; charset=UTF-8");
    header("Content-Language: en");
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GMT");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header('Content-Disposition: attachment; filename="'.$filename.'"');
    header("Pragma: no-cache");

    print implode(",", array_keys($report[0]));
    print "\n";
    foreach($report as $entry) {
        print implode(",", $entry);
        print "\n";
    }
}

if (!empty($_REQUEST)) {
    // Retrieve and sanitize POST data
    $arguments = [
    'min_hour'         => FILTER_SANITIZE_NUMBER_INT,
    'dept_report'      => FILTER_SANITIZE_NUMBER_INT,
    'dept_name'        => FILTER_SANITIZE_SPECIAL_CHARS,
    ];

    require_once($FUNCTIONDIR."/volunteer.inc");

    $updateData = filter_input_array(INPUT_GET, $arguments);

    if (isset($updateData['min_hour'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            $min = $updateData['min_hour'];
            $report = volunteer_minimum_hour_report($min);
            output_cvs($report, "hour_report.csv");
            exit();
        } else {
            header("HTTP/1.0 401");
            exit();
        }
    }

    if (isset($updateData['dept_report'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            $dept = $updateData['dept_report'];
            $name = $updateData['dept_name'];
            $report = volunteers_in_dept(intval($dept));
            output_cvs($report, "department_report_".$name.".csv");
            exit();
        } else {
            header("HTTP/1.0 401");
            exit();
        }
    }

    $arguments = [
    'rewardId'         => FILTER_SANITIZE_SPECIAL_CHARS,
    'rewards'          => FILTER_UNSAFE_RAW,
    'validate_login'   => FILTER_SANITIZE_SPECIAL_CHARS,
    'validate_passwd'  => FILTER_SANITIZE_ENCODED,
    'update_hour'      => FILTER_UNSAFE_RAW,
    'delete_hour'      => FILTER_SANITIZE_SPECIAL_CHARS,
    'update_prize'     => FILTER_UNSAFE_RAW,
    'delete_prize'     => FILTER_SANITIZE_SPECIAL_CHARS,
    'new_prize'        => FILTER_UNSAFE_RAW,
    'toggleKiosk'      => FILTER_SANITIZE_SPECIAL_CHARS,
    ];

    $updateData = filter_input_array(INPUT_POST, $arguments);
    if (isset($updateData['rewardId'])) {
        $data = json_decode($updateData['rewards'], true);
        $prizes = [];
        foreach ($data as $prize) {
            $prizes[] = $prize['PrizeID'];
        }
        award_prizes($updateData['rewardId'], $prizes);
        echo $updateData['rewards'];
        exit();
    }

    require_once($FUNCTIONDIR."/authentication.inc");

    if (isset($updateData['validate_login'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            if (doUserAndPasswordMatch($updateData['validate_login'], urldecode($updateData['validate_passwd']))) {
                setcookie("CIAB_VOLUNTEERADMIN", true);
                exit;
            } else {
                header("HTTP/1.0 401");
                unset($_COOKIE["CIAB_VOLUNTEERADMIN"]);
                exit();
            }
        }
    }

    if (isset($updateData['update_hour'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            $item = json_decode($updateData['update_hour']);
            update_volunteer_hours($item->{'EntryID'}, null, $item->{'Actual Hours'}, $item->{'End Date Time'}, $item->{'Time Modifier'}, $item->{'Department Worked'}, null, $item->{'Authorized By'});
            exit();
        } else {
            header("HTTP/1.0 401");
            exit();
        }
    }

    if (isset($updateData['delete_hour'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            delete_volunteer_hours($updateData['delete_hour']);
            exit();
        }
    }

    if (isset($updateData['update_prize'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            $item = json_decode($updateData['update_prize']);
            if ($item->{'RewardGroupID'} == 'new') {
                $group = add_volunteer_prize_group($item->{'GroupLimit'});
            } elseif ($item->{'RewardGroupID'} != '') {
                $group = $item->{'RewardGroupID'};
                update_volunteer_prize_group($group, $item->{'GroupLimit'});
            } else {
                $group = $item->{'RewardGroupID'};
            }
            update_volunteer_prize($item->{'PrizeID'}, $item->{'Name'}, $item->{'Value'}, ($item->{'Promo'} == 'yes'), $group, $item->{'TotalInventory'});
            exit();
        } else {
            header("HTTP/1.0 401");
            exit();
        }
    }

    if (isset($updateData['delete_prize'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            delete_volunteer_prize($updateData['delete_prize']);
            exit();
        }
    }

    if (isset($updateData['new_prize'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            $item = json_decode($updateData['new_prize']);
            if ($item->{'RewardGroupID'} == 'new') {
                $group = add_volunteer_prize_group($item->{'GroupLimit'});
            } elseif ($item->{'RewardGroupID'} != '') {
                $group = $item->{'RewardGroupID'};
                update_volunteer_prize_group($group, $item->{'GroupLimit'});
            } else {
                $group = $item->{'RewardGroupID'};
            }
            new_volunteer_prize($item->{'Name'}, $item->{'Value'}, ($item->{'Promo'} == 'yes'), $group, $item->{'TotalInventory'});
            exit();
        } else {
            header("HTTP/1.0 401");
            exit();
        }
    }

    if (isset($updateData['toggleKiosk'])) {
        if (isset($_SESSION['IS_ADMIN']) || isset($_SESSION['IS_VOLUNTEERS'])) {
            if (isset($_SESSION['kioskMode'])) {
                unset($_SESSION['kioskMode']);
            } else {
                $_SESSION['kioskMode'] = 'volunteers';
            }
            exit();
        }
    }

}