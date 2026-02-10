<?php
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

class JwtHandler {
    public function __construct() {}
    private $secret = "your_secret_key_change_this_In_Production";

    public function generateToken($data) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($data);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public function validateToken($token) {
        $tokenParts = explode('.', $token);
        if (count($tokenParts) != 3) return null;

        $header = $tokenParts[0];
        $payload = $tokenParts[1];
        $signatureProvided = $tokenParts[2];

        $signature = hash_hmac('sha256', $header . "." . $payload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if ($base64UrlSignature === $signatureProvided) {
            return json_decode(base64_decode($payload), true);
        }
        return null;
    }
    
    public function getAuthId() {
        $headers = getallheaders();
        $authHeader = null;

        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        } elseif (isset($_SERVER['Authorization'])) {
            $authHeader = $_SERVER['Authorization'];
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        if ($authHeader) {
            $token = str_replace('Bearer ', '', $authHeader);
            $data = $this->validateToken($token);
            if ($data && isset($data['user_id'])) {
                return $data['user_id'];
            }
        }
        return null;
    }
}
?>
