<?php
// login.php

// Inicia a sessão no PHP
session_start();

// Exemplo simples de conexão com Banco de Dados (MySQL via PDO)
/*
$host = 'localhost';
$db   = 'synccion_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}
*/

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recebe e higieniza os dados do formulário
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $senha = $_POST['password'] ?? '';
    $lembrar = isset($_POST['remember']);

    if (!$email || empty($senha)) {
        // Redireciona com erro se os campos estiverem vazios
        header('Location: index.html?error=campos_invalidos');
        exit;
    }

    /* 
    --- EXEMPLO DE CONSULTA NO BANCO ---
    $stmt = $pdo->prepare("SELECT id, nome, senha_hash FROM usuarios WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($usuario && password_verify($senha, $usuario['senha_hash'])) {
        // Sucesso no login
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nome'] = $usuario['nome'];
        
        header('Location: dashboard.php'); // Redireciona para o painel principal
        exit;
    } else {
        // Erro de credenciais
        header('Location: index.html?error=credenciais_incorretas');
        exit;
    }
    */

    // Teste mockado (apenas para testar o envio sem banco de dados):
    if ($email === 'admin@synccion.com' && $senha === '123456') {
        echo "Login realizado com sucesso! Bem-vindo ao dashboard.";
    } else {
        echo "Credenciais incorretas!";
    }
}
?>