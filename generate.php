<?php
header('Content-Type: application/json');

function log_message($message, $logfile) {
    file_put_contents($logfile, $message . "\n", FILE_APPEND);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Collect and sanitize inputs
    $capturingKit = isset($_POST['capturingKit']) ? htmlspecialchars($_POST['capturingKit']) : '';
    $mainSampleId = isset($_POST['mainSample']) ? htmlspecialchars($_POST['mainSample']) : '';
    $comparisonSampleIds = isset($_POST['comparisonSamples']) ? htmlspecialchars($_POST['comparisonSamples']) : '';
    $geneName = isset($_POST['gene']) ? htmlspecialchars($_POST['gene']) : '';
    $indicator = isset($_POST['outputName']) ? htmlspecialchars($_POST['outputName']) : '';
    $plotType = isset($_POST['plotType']) ? htmlspecialchars($_POST['plotType']) : '';
    $username = isset($_POST['username']) ? htmlspecialchars($_POST['username']) : '';

    switch ($capturingKit) {
        case 'CE':
            $xlsxFile = 'files/CE_Coverage.xlsx';
            break;
        case 'FEV2F2both':
            $xlsxFile = 'files/FEV2F2both_Coverage.xlsx';
            break;
        case 'SE8':
            $xlsxFile = 'files/SE8_Coverage.xlsx';
            break;
        case 'GE':
            $xlsxFile = 'files/GE_Coverage.xlsx';
            break;
        case 'CEFu':
            $xlsxFile = 'files/CEFu_Coverage.xlsx';
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid capturing kit.']);
            exit;
    }
    
    $todayDate = date('Y-m-d');
    $dateFolder = __DIR__ . "/output/$todayDate";
    $sampleFolder = "$dateFolder/{$mainSampleId}_{$username}";

    if (!file_exists($sampleFolder)) {
        mkdir($sampleFolder, 0777, true);
    }

    $logfile = "$sampleFolder/logfile.log";

    log_message("Inputs - capturingKit: $capturingKit, mainSampleId: $mainSampleId, comparisonSampleIds: $comparisonSampleIds, geneName: $geneName, indicator: $indicator, plotType: $plotType, username: $username", $logfile);

    $outputXlsx = "$sampleFolder/{$mainSampleId}_{$geneName}_{$username}_AmpStatus.csv";

    if ($plotType === 'heatmap') {
        putenv('LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:/usr/lib/i386-linux-gnu');
        $command1 = escapeshellcmd("/usr/bin/python3 comparison_simple_regionwise_Single_gene.py $xlsxFile $geneName $mainSampleId $comparisonSampleIds $username $sampleFolder 2>&1");
        $output1 = shell_exec($command1);
        $command2 = escapeshellcmd("/usr/bin/python3 Heatmap_RCLogTransform_v2.py $geneName $outputXlsx $username $sampleFolder $mainSampleId 2>&1");
        $output2 = shell_exec($command2);
        log_message("Command1 output: " . $output1, $logfile);
        log_message("Command2 output: " . $output2, $logfile);

        $imagePath = "$sampleFolder/{$mainSampleId}_{$geneName}_{$username}_heatmap.png"; 
        $summaryCsv = "$sampleFolder/{$mainSampleId}_{$geneName}_{$username}_Summary.csv";

        $maxWaitTime = 120;
        $waitInterval = 1;
        $elapsedTime = 0;

        while (!file_exists($summaryCsv) && $elapsedTime < $maxWaitTime) {
            sleep($waitInterval);
            $elapsedTime += $waitInterval;
        }

        if (file_exists($summaryCsv)) {
            $csvData = array_map('str_getcsv', file($summaryCsv));
        } else {
            echo json_encode(['success' => false, 'message' => 'Summary CSV file not found.']);
            exit;
        }
        
        // Structure CSV data for JSON
        $csvHeaders = array_shift($csvData); // Remove headers from data
        $csvData = array_map(function($row) use ($csvHeaders) {
            return array_combine($csvHeaders, $row);
        }, $csvData);

        // Ensure the correct format of imagePath and csvPath for JSON response
        $relativeImagePath = str_replace(__DIR__ . '/', '', $imagePath);
        $relativeSummaryCsvPath = str_replace(__DIR__ . '/', '', $summaryCsv);

        $response = [
            'success' => true,
            'imagePath' => $relativeImagePath,
            'csvData' => $csvData,
        ];

        log_message("Response: " . json_encode($response), $logfile); // Log the JSON response
        echo json_encode($response);
    } elseif ($plotType === 'barplot') {
        // Add barplot generation logic here
        echo json_encode(['success' => false, 'message' => 'Barplot functionality not implemented yet.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid plot type.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>

