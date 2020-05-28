package com.redhat.jkang;

import java.lang.reflect.Method;

import org.ietf.jgss.GSSManager;

public class Main {
    public static void main(String[] args) {
        GSSManager gssm = GSSManager.getInstance();
        System.out.println("Hello World! " + gssm.toString());

        try {
            Class<?> c = Class.forName("com.redhat.jkang.module.Mod");
            Method m = c.getMethod("call");
            m.invoke(c);
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            Class<?> c = Class.forName("com.redhat.jkang.Test");
            Method m = c.getMethod("call");
            m.invoke(c);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
