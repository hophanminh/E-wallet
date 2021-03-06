class Properties {
  static const String API_LOCAL = String.fromEnvironment('API_URL', defaultValue: '192.168.1.93:9000');//"e-money-backend.herokuapp.com"

  static const String API_PRODUCTION = "";
  static const PASSWORD_MIN_LENGTH = 6;
  static const ROLE_ADMIN = 1;
  static const ROLE_USER = 0;
  static const ROLE_ACTIVE = 1;
  static const AMOUNT_TO_LOAD_PER_TIME = 10;
}
