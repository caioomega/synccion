<?php
// cadastro.php — recebe o formulário "Criar conta" de login.html
// Ainda sem banco de dados: valida os campos e devolve uma resposta simples.
// Quando houver backend, é aqui que entra o INSERT na tabela de usuários.

session_start();

$planos = ['essencial' => 800, 'profissional' => 1600, 'industrial' => 3000];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.html#criar-conta');
    exit;
}

$nome    = trim($_POST['nome'] ?? '');
$empresa = trim($_POST['empresa'] ?? '');
$email   = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$senha   = $_POST['password'] ?? '';
$confirma = $_POST['password_confirm'] ?? '';
$plano   = $_POST['plano'] ?? '';
$ciclo   = ($_POST['ciclo'] ?? 'mensal') === 'anual' ? 'anual' : 'mensal';
$aceite  = isset($_POST['aceite']);

$erros = [];
if (mb_strlen($nome) < 2)                         $erros[] = 'nome';
if (mb_strlen($empresa) < 2)                      $erros[] = 'empresa';
if (!$email)                                       $erros[] = 'email';
if (strlen($senha) < 8 || !preg_match('/\d/', $senha) || !preg_match('/[A-Za-z]/', $senha)) $erros[] = 'senha';
if ($senha !== $confirma)                          $erros[] = 'confirmacao';
if (!isset($planos[$plano]))                       $erros[] = 'plano';
if (!$aceite)                                      $erros[] = 'aceite';

if ($erros) {
    header('Location: login.html?error=cadastro_invalido&plano=' . urlencode($plano) . '&ciclo=' . $ciclo . '#criar-conta');
    exit;
}

$mensal = $planos[$plano];
$valor  = $ciclo === 'anual' ? $mensal * 12 : $mensal;

/*
--- EXEMPLO COM BANCO (PDO) ---
$hash = password_hash($senha, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO usuarios (nome, empresa, email, senha_hash, plano, ciclo) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$nome, $empresa, $email, $hash, $plano, $ciclo]);
$_SESSION['usuario_id'] = $pdo->lastInsertId();
header('Location: dashboard.php');
exit;
*/

// Resposta mockada, só para testar o envio sem banco de dados
header('Content-Type: text/plain; charset=utf-8');
echo "Conta criada com sucesso!\n";
echo "Nome: $nome\nEmpresa: $empresa\nE-mail: $email\n";
echo "Plano: " . ucfirst($plano) . " ($ciclo) — R$ " . number_format($valor, 0, ',', '.') . ($ciclo === 'anual' ? '/ano' : '/mês') . "\n";
