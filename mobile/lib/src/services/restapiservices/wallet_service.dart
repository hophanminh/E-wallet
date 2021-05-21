import 'dart:io';

import 'package:mobile/src/config/config.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/src/services/secure_storage_service.dart';

class WalletService {
  static const String _baseURL = Properties.API_LOCAL;

  static final WalletService instance = WalletService._internal(); // singleton for this class

  factory WalletService() => instance;

  WalletService._internal();

  Future<String> getListIcon() async {
    String token = await SecureStorage.readSecureData('jwtToken');

    http.Response res = await http
        .post(Uri.http(_baseURL, '/icons/list'), headers: {HttpHeaders.contentTypeHeader: 'application/json; charset=UTF-8', HttpHeaders.authorizationHeader: 'Bearer $token'});

    return res.body;
  }

  Future<http.StreamedResponse> addTxImage(String txID, File image) async {
    String token = await SecureStorage.readSecureData('jwtToken');

    var stream = image.readAsBytesSync();
    var req = new http.MultipartRequest("POST", Uri.http(_baseURL, 'transaction-images', {'transactionID': txID}));
    var multipartFile = http.MultipartFile.fromBytes('images', stream, filename: image.path.split("/").last);
    req.headers.addAll({HttpHeaders.authorizationHeader: 'Bearer $token'});
    req.files.add(multipartFile);
    return await req.send();
  }
}
