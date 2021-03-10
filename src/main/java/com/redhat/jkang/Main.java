package com.redhat.jkang;

import java.io.IOException;
import java.nio.file.Paths;

import jdk.jfr.Description;
import jdk.jfr.Event;
import jdk.jfr.Label;
import jdk.jfr.Recording;

public class Main {

    @Label("MyEvent")
    @Description("Basic event")
    public static class MyEvent extends Event {
        @Label("Message")
        String message;
    }

    public static void main(String[] args) throws IOException {
        Recording r = new Recording();
        r.start();
        MyEvent e = new MyEvent();
        e.message = "Hello World!";
        e.commit();

        r.stop();
        r.dump(Paths.get("recording.jfr"));
    }
}
