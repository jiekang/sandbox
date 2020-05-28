package com.redhat.jkang.module;

import org.ietf.jgss.GSSManager;

public class Mod {
    public static void call() {
        GSSManager m = GSSManager.getInstance();
        System.out.println("Mod: " + m);
    }
}