package com.redhat.jmc.grafana;

import static org.openjdk.jmc.common.unit.UnitLookup.NUMBER;

import java.io.File;

import org.openjdk.jmc.common.item.Aggregators;
import org.openjdk.jmc.common.item.Attribute;
import org.openjdk.jmc.common.item.IAttribute;
import org.openjdk.jmc.common.item.IItemCollection;
import org.openjdk.jmc.common.item.ItemFilters;
import org.openjdk.jmc.common.unit.IQuantity;
import org.openjdk.jmc.flightrecorder.JfrLoaderToolkit;

public class CustomEventRecording {

    public static final IAttribute<IQuantity> WORK_LEFT = Attribute.attr("workLeft", "MCCustomEventDemo$CustomEvent" ,NUMBER);
    
    public static void main(String[] args) throws Exception {
        IItemCollection events = JfrLoaderToolkit.loadEvents(new File(args[0]));
        IQuantity aggregate = events.apply(ItemFilters.type("MCCustomEventDemo$CustomEvent")).
                getAggregate(Aggregators.avg(WORK_LEFT));
        System.out.println("The average for the Java MCCustomEventDemo.workLeft " + aggregate.displayUsing("auto"));
        aggregate = events.apply(ItemFilters.type("MCCustomEventDemo$CustomEvent")).
                getAggregate(Aggregators.stddev(WORK_LEFT));
                
        aggregate = events.apply(ItemFilters.type("MCCustomEventDemo$CustomEvent")).
                getAggregate(Aggregators.stddevp(WORK_LEFT));
        System.out.println("The population standard deviation for the Java MCCustomEventDemo.workLeft " + aggregate.displayUsing("auto"));
    }
}
