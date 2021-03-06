import 'package:flutter/material.dart';
import 'package:mobile/src/models/NotificationProvider.dart';
import 'package:mobile/src/models/UsersProvider.dart';
import 'package:mobile/src/services/secure_storage_service.dart';
import 'package:mobile/src/services/socketservices/socket.dart';
import 'package:mobile/src/views/utils/helpers/helper.dart';
import 'package:outline_material_icons/outline_material_icons.dart';
import 'package:provider/provider.dart';
import 'package:socket_io_client/socket_io_client.dart';

const TextStyle myErrorTextStyle = TextStyle(fontWeight: FontWeight.bold, color: error, fontSize: 13);

Align myLabelText(String title, {AlignmentGeometry position = Alignment.centerLeft, double fontSize = 16.0}) => Align(
      alignment: position,
      child: Text(
        title,
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: fontSize),
      ),
    );

InputDecoration myInputDecoration(String placeholder, {String label, Color inputBorder = primary, Widget suffix = null, int maxErrorLine = 1}) => InputDecoration(
      hintText: placeholder,
      contentPadding: EdgeInsets.symmetric(vertical: 10.0, horizontal: 10.0),
      focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: inputBorder, width: 1.0), borderRadius: BorderRadius.circular(10)),
      enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: inputBorder, width: 1.0), borderRadius: BorderRadius.circular(10)),
      errorBorder: OutlineInputBorder(borderSide: BorderSide(color: error, width: 1.0), borderRadius: BorderRadius.circular(10)),
      focusedErrorBorder: OutlineInputBorder(borderSide: BorderSide(color: error, width: 1.0), borderRadius: BorderRadius.circular(10)),
      filled: true,
      fillColor: Colors.white,
      errorStyle: myErrorTextStyle,
      suffix: suffix,
      errorMaxLines: maxErrorLine != null ? maxErrorLine : 1,
      labelText: label,
      alignLabelWithHint: true,
    );

AppBar mySimpleAppBar(String title, {Color shadow}) => AppBar(
      // app bar without 'action' property
      iconTheme: IconThemeData(color: Colors.white),
      title: Text(title, style: TextStyle(color: Colors.white)),
      backgroundColor: primary,
      centerTitle: true,
      shadowColor: shadow,
    );

Widget mySideBar({BuildContext context, @required String mainRouteName, String avatarURL, @required String name, Function setMainRoute}) {
  return Drawer(
    child: Column(
      children: <Widget>[
        DrawerHeader(
          // margin: EdgeInsets.zero,
          // padding: const EdgeInsets.all(0.0),
          decoration: BoxDecoration(
            color: primary,
            image: DecorationImage(image: AssetImage('assets/images/sidebar.png'), fit: BoxFit.fill, colorFilter: ColorFilter.mode(Colors.white10, BlendMode.darken)),
          ),
          child: Row(
            children: [
              myCircleAvatar(avatarURL, 35),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Text(
                    name,
                    style: TextStyle(fontSize: 25, color: Colors.white),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              _createDrawerItem(
                  title: 'Thông tin cá nhân',
                  icon: Icons.info_outline,
                  mainRouteName: 'profile' == mainRouteName,
                  onTap: () {
                    Navigator.pop(context);
                    setMainRoute('profile');
                  }),
              _createDrawerItem(
                  title: 'Đổi mật khẩu',
                  icon: Icons.lock,
                  mainRouteName: 'changepassword' == mainRouteName,
                  onTap: () {
                    Navigator.pop(context);
                    setMainRoute('changepassword');
                  }),
              Divider(
                thickness: 0.75,
              ),
              _createDrawerItem(
                  title: 'Ví cá nhân',
                  icon: Icons.account_balance_wallet_outlined,
                  mainRouteName: 'privateWallet' == mainRouteName,
                  onTap: () {
                    Navigator.pop(context);
                    setMainRoute('privateWallet');
                  }),
              _createDrawerItem(
                  title: 'Danh sách nhóm',
                  icon: Icons.group_outlined,
                  mainRouteName: 'teamList' == mainRouteName,
                  onTap: () {
                    Navigator.pop(context);
                    setMainRoute('teamList');
                  }),
              _createNotificationItem('notifications' == mainRouteName, () {
                Navigator.pop(context);
                setMainRoute('notifications');
              })
            ],
          ),
        ),
        Divider(
          thickness: 0.75,
        ),
        _createDrawerItem(
            title: 'Đăng xuất',
            icon: Icons.logout,
            onTap: () {
              clearSocket();
              SecureStorage.deleteAllSecureData();
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            }),
      ],
    ),
  );
}

Widget _createDrawerItem({IconData icon, String title, Function onTap, bool mainRouteName}) => ListTile(
      title: Row(
        children: <Widget>[
          Icon(icon),
          Padding(
            padding: EdgeInsets.only(left: 8.0),
            child: Text(title),
          ),
        ],
      ),
      selected: mainRouteName == true,
      selectedTileColor: Colors.black12,
      trailing: mainRouteName == true ? Icon(Icons.chevron_right_outlined) : null,
      onTap: () => onTap(),
    );

Widget _createNotificationItem(bool mainRouteName, Function onTap) => ListTile(
      title: Row(
        children: <Widget>[
          Icon(
            Icons.notifications_none_outlined,
          ),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(left: 8.0),
              child: Text('Thông báo'),
            ),
          ),
          Consumer<NotificationProvider>(builder: (context, notificationProvider, child) {
            if (notificationProvider.count != 0) {
              return Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.red),
                alignment: Alignment.center,
                child: Text(
                  '${notificationProvider.count > 99 ? '+99' : notificationProvider.count}',
                  style: TextStyle(fontSize: 11, color: Colors.white),
                ),
              );
            } else {
              return Container();
            }
          })
        ],
      ),
      selected: mainRouteName == true,
      selectedTileColor: Colors.black12,
      trailing: mainRouteName == true ? Icon(Icons.chevron_right_outlined) : null,
      onTap: () => onTap(),
    );

Align myAlignedButton(
  String text, {
  Function action,
  AlignmentGeometry alignment = Alignment.center,
  Color backgroundColor = primary,
  Color textColor = Colors.white,
  double fontSize = 17.0,
  BorderSide borderSide,
  EdgeInsetsGeometry padding = const EdgeInsets.symmetric(horizontal: 40, vertical: 10),
}) =>
    Align(
      alignment: alignment,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(primary: backgroundColor, padding: padding, side: borderSide, textStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: fontSize)),
        onPressed: action, // != null ? action : () {},
        child: Text(
          text,
          style: TextStyle(color: textColor),
        ),
      ),
    );

ElevatedButton myFullWidthButton(
  String text, {
  Function action,
  AlignmentGeometry alignment = Alignment.center,
  Color backgroundColor = primary,
  Color textColor = Colors.white,
  double fontSize = 17.0,
  BorderSide borderSide,
  EdgeInsetsGeometry padding = const EdgeInsets.symmetric(horizontal: 40, vertical: 10),
}) =>
    ElevatedButton(
      style: ElevatedButton.styleFrom(primary: backgroundColor, padding: padding, side: borderSide, textStyle: TextStyle(fontWeight: FontWeight.bold, fontSize: fontSize)),
      onPressed: action, // != null ? action : () {},
      child: Text(
        text,
        style: TextStyle(color: textColor),
      ),
    );

Widget myCircleAvatar(String avatarURL, double radius, {Key key}) => Container(
      key: key,
      decoration: new BoxDecoration(
        shape: BoxShape.circle,
        border: new Border.all(
          color: Colors.white60,
          width: 4.0,
        ),
      ),
      child: CircleAvatar(
        backgroundImage: avatarURL == null ? AssetImage('assets/images/default_avatar.png') : NetworkImage(avatarURL),
        radius: radius,
      ),
    );

// color from database is hexadecimal : #123456; convert to int
CircleAvatar myCircleIcon(String name, String background, String foreground, {double size = 28.0}) {
  try {
    Color backgroundColor = Color(int.parse('0xff' + background.substring(1)));
    Color foregroundColor = Color(int.parse('0xff' + foreground.substring(1)));
    return CircleAvatar(
        backgroundColor: backgroundColor,
        // foregroundColor: Color(int.parse('0xff' + foreground.substring(1))),
        child: Icon(
          IconData(int.parse('${OMIcons.codePoints[name]}'), fontFamily: 'outline_material_icons', fontPackage: 'outline_material_icons'),
          color: foregroundColor,
          size: size,
        ));
  } on RangeError catch (e) {
    return CircleAvatar(
        backgroundColor: Color(int.parse('0xffffffff')),
        // foregroundColor: Color(int.parse('0xff' + foreground.substring(1))),
        child: Icon(
          Icons.loop_outlined,
          color: Colors.white,
          size: size,
        ));
  } on Exception catch (e) {
    return CircleAvatar(
        backgroundColor: Colors.red,
        // foregroundColor: Color(int.parse('0xff' + foreground.substring(1))),
        child: Icon(
          Icons.broken_image_outlined,
          color: Colors.white,
          size: size,
        ));
  }
}

Widget mySearchBar(BuildContext context, TextEditingController controller, String hint, {double radius = 4}) => Container(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Material(
          elevation: 5.0,
          borderRadius: BorderRadius.all(Radius.circular(radius)),
          child: TextField(
            controller: controller,
            cursorColor: Theme.of(context).primaryColor,
            style: TextStyle(color: Colors.black, fontSize: 18),
            decoration: InputDecoration(
                hintText: hint,
                hintStyle: TextStyle(color: Colors.black38, fontSize: 16),
                prefixIcon: Material(
                  elevation: 0.0,
                  borderRadius: BorderRadius.all(Radius.circular(30)),
                  child: Icon(Icons.search),
                ),
                suffixIcon: IconButton(
                  onPressed: () => controller.clear(),
                  icon: Icon(Icons.clear),
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 25, vertical: 13)),
          ),
        ),
      ),
    );

Widget myAppBarIcon(_scaffoldKey){
  return Padding(
      padding: EdgeInsets.only(top: 5),
      child: Stack(
        children: <Widget>[
          new IconButton(
              icon: Icon(Icons.menu),
              onPressed: () {
                _scaffoldKey.currentState.openDrawer();
              }),
          Consumer<NotificationProvider>(
              builder: (context, notificationProvider, child) {
                if (notificationProvider.count != 0) {
                  return Positioned(
                    right: 11,
                    top: 11,
                    child: new Container(
                      padding: EdgeInsets.all(2),
                      decoration: new BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      constraints: BoxConstraints(
                        minWidth: 14,
                        minHeight: 14,
                      ),
                      child: Text(
                        notificationProvider.count.toString(),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                } else {
                  return Container();
                }
              })
        ],
      ));
}