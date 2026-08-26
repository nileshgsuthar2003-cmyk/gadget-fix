<?php
class RepairController {
    private $repairModel;

    public function __construct() {
        $this->repairModel = new Repair();
    }

    public function index() {
        try {
            $repairs = $this->repairModel->getAll();
            echo json_encode($repairs);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function show($id) {
        try {
            $repair = $this->repairModel->getById($id);
            if ($repair) {
                echo json_encode($repair);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Repair not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>
