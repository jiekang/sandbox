# Extension Proof of Concept

## Instructions

Modify the jboss-client jar and make it an OSGi extension bundle for `org.openjdk.jmc.rjmx` with the manifest file provided in this directory.

```
$ jar -ufm /path/to/jboss-client.jar jboss-jmx.mf
```

Place the updated jar into the jmc dropins folder:
```
$ mv /path/to/jboss-client.jar /path/to/jmc/dropins/
```


Run JMC and create a rjmx connection to `service:jmx:remote+http://localhost:9990`. This should work on both OpenJDK 8 and OpenJDK 11. Use -clean to make sure the environment is clean for testing purposes.

```
$ jmc -clean -vm /path/to/jdk/bin
```
