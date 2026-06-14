package com.bookmie.lit.ops;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class OpsService {

  @Value("${security.encryptionKey}")
  private String encryptionKeyBase64;

  private SecretKeySpec getKey() {
    byte[] key = Base64.getDecoder().decode(encryptionKeyBase64);
    return new SecretKeySpec(key, "AES");
  }

  public String encryptEnvData(String data) {
    try {
      Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
      byte[] iv = new byte[16];
      new SecureRandom().nextBytes(iv);
      IvParameterSpec ivSpec = new IvParameterSpec(iv);

      cipher.init(Cipher.ENCRYPT_MODE, getKey(), ivSpec);
      byte[] encrypted = cipher.doFinal(data.getBytes());

      byte[] ivAndCiphertext = new byte[iv.length + encrypted.length];
      System.arraycopy(iv, 0, ivAndCiphertext, 0, iv.length);
      System.arraycopy(encrypted, 0, ivAndCiphertext, iv.length, encrypted.length);

      return Base64.getEncoder().encodeToString(ivAndCiphertext);
    } catch (Exception e) {
      throw new RuntimeException("Encryption error", e);
    }
  }

  public String decryptEnvData(String encryptedBase64) {
    try {
      byte[] ivAndEncrypted = Base64.getDecoder().decode(encryptedBase64);
      byte[] iv = new byte[16];
      byte[] encrypted = new byte[ivAndEncrypted.length - 16];

      System.arraycopy(ivAndEncrypted, 0, iv, 0, 16);
      System.arraycopy(ivAndEncrypted, 16, encrypted, 0, encrypted.length);

      Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
      cipher.init(Cipher.DECRYPT_MODE, getKey(), new IvParameterSpec(iv));
      byte[] decrypted = cipher.doFinal(encrypted);

      return new String(decrypted);
    } catch (Exception e) {
      throw new RuntimeException("Decryption error", e);
    }
  }

  // You can now safely call encryptEnvData() and decryptEnvData()
}
