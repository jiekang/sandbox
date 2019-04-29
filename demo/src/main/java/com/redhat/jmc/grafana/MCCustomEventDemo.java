package com.redhat.jmc.grafana;

import java.lang.Thread;
import jdk.jfr.Label;
import java.lang.InterruptedException;

public class MCCustomEventDemo {

    @Label("MCCustomEventDemoEvent")
    class CustomEvent extends jdk.jfr.Event {
        @Label("workLeft")
        int workLeft;
    }

    public static void main(String[] args) {
        MCCustomEventDemo demo = new MCCustomEventDemo();
        while (true) {
            int left = demo.doSomeWork();
            demo.updateData(left);
        }
    }

    private int doSomeWork() {
        try {
            int sleep = 100 + (int) (Math.random() * 1000);
            Thread.sleep(sleep);
        } catch (InterruptedException e) {
        }
        int left = (int) (Math.random() * 100);
        System.err.println("remaining: " + left);
        return left;
    }

    private void updateData(int data) {
        long start = System.currentTimeMillis();
        CustomEvent event = new CustomEvent();
        event.workLeft = data;
        event.commit();
        long end = System.currentTimeMillis();
        long duration = end - start;
        System.out.println("dur: " + duration);
    }
}
