package com.bookmie.lit.utils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class EmailTemplateLoader {

  private static final Map<String, String> templateCache = new ConcurrentHashMap<>();

  public static String loadTemplate(String filename) throws Exception {
    if (templateCache.containsKey(filename)) {
      return templateCache.get(filename);
    }

    try (InputStream inputStream = EmailTemplateLoader.class
        .getClassLoader()
        .getResourceAsStream("templates/" + filename)) {

      if (inputStream == null) {
        throw new IllegalArgumentException("File not found in resources/templates: " + filename);
      }

      String content = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
      templateCache.put(filename, content);
      return content;
    }
  }
}
