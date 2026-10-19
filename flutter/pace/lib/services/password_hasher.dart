import 'dart:convert' show base64Decode, base64Encode, utf8;
import 'dart:isolate' show Isolate;
import 'dart:math' show Random;
import 'dart:typed_data' show Uint8List;
import 'package:crypto/crypto.dart' show Hmac, sha256;

/// Hashes and checks passwords with PBKDF2-HMAC-SHA256 and a random per-password salt, so the
/// device never stores a password. The work runs on a background isolate to keep the UI smooth.
///
/// Stored format: `pbkdf2-sha256$<iterations>$<base64 salt>$<base64 hash>`.
class PasswordHasher {
  static const _scheme = 'pbkdf2-sha256';
  /// Work factor. OWASP suggests 600,000 for PBKDF2-HMAC-SHA256, but pure-Dart PBKDF2 at that
  /// level takes seconds per sign-in on a phone, so the prototype uses 210,000 (~0.4 s on a
  /// desktop). Raise it (or move to a native KDF) for production; lower it only in tests.
  /// Existing hashes keep working when this changes because each stores its own count.
  final int iterations;
  const PasswordHasher({this.iterations = 210000});

  Future<String> hash(String password) async {
    final rng = Random.secure();
    final salt = Uint8List.fromList(List<int>.generate(16, (_) => rng.nextInt(256)));
    final n = iterations;
    final digest = await Isolate.run(() => _pbkdf2(password, salt, n));
    return '$_scheme\$$n\$${base64Encode(salt)}\$${base64Encode(digest)}';
  }

  /// False for a wrong password or an unrecognised [stored] value.
  Future<bool> verify(String password, String stored) async {
    final parts = stored.split(r'$');
    if (parts.length != 4 || parts[0] != _scheme) return false;
    final n = int.tryParse(parts[1]);
    if (n == null || n <= 0) return false;
    final salt = base64Decode(parts[2]);
    final expected = base64Decode(parts[3]);
    final actual = await Isolate.run(() => _pbkdf2(password, salt, n));
    return _constantTimeEquals(actual, expected);
  }

  /// PBKDF2 with a single 32-byte block (the SHA-256 output size).
  static List<int> _pbkdf2(String password, List<int> salt, int iterations) {
    final hmac = Hmac(sha256, utf8.encode(password));
    var u = hmac.convert([...salt, 0, 0, 0, 1]).bytes;
    final out = List<int>.of(u);
    for (var i = 1; i < iterations; i++) {
      u = hmac.convert(u).bytes;
      for (var j = 0; j < out.length; j++) {
        out[j] ^= u[j];
      }
    }
    return out;
  }

  static bool _constantTimeEquals(List<int> a, List<int> b) {
    if (a.length != b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }
    return diff == 0;
  }
}
