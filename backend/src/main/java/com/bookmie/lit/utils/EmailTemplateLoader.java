package com.bookmie.lit.utils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class EmailTemplateLoader {

  public static String loadTemplate(String filename) throws Exception {
    InputStream inputStream = EmailTemplateLoader.class
        .getClassLoader()
        .getResourceAsStream("templates/" + filename);

    if (inputStream == null) {
      throw new IllegalArgumentException("File not found in resources/templates: " + filename);
    }

    return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
  }
}
