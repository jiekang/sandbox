package com.redhat.jkang;

import org.ietf.jgss.GSSManager;

public class Test {
    public static void call() {
        GSSManager m = GSSManager.getInstance();
        System.out.println("Test: " + m);
    }
}