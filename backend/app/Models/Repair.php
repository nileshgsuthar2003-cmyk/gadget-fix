<?php
class Repair {
    private $pdo;

    public function __construct() {
        $this->pdo = Database::getInstance()->getConnection();
    }

    public function getAll() {
        $stmt = $this->pdo->query('SELECT repairs.*, users.name as user_name FROM repairs LEFT JOIN users ON repairs.user_id = users.id ORDER BY repairs.created_at DESC');
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare('SELECT repairs.*, users.name as user_name FROM repairs LEFT JOIN users ON repairs.user_id = users.id WHERE repairs.id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}
?>
