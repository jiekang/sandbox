package com.redhat.jmc.prometheus;

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
        } catch (InterruptedException e) {}
        int left = (int) (Math.random() * 100);
        System.err.println("remaining: " + left);
        return left;
    }

    private void updateData(int data) {
    	CustomEvent event = new CustomEvent();
    	event.workLeft = data;
    	event.commit();
    }
}
