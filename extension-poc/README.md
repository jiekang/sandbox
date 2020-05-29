# Extension Proof of Concept

## Setting up WildFly

Download and unzip latest WildFly release. https://wildfly.org/downloads/

Add a user:
```
cd /path/to/wildfly-20.0.0.Beta1/bin
./add-user.sh -u admin -p password1!
```

Start the application server:

```
cd /path/to/wildfly-20.0.0.Beta1/bin
./standalone.sh
```


## Instructions

Modify `/path/to/wildfly-20.0.0.Beta1/bin/client/jboss-client.jar` and make it an OSGi extension bundle for `org.openjdk.jmc.rjmx` with the manifest file provided in this directory. The command updates the manifest additively.

```
$ jar -ufm /path/to/jboss-client.jar jboss-jmx.mf
```

Place the updated jar into the jmc dropins folder:
```
$ mv /path/to/jboss-client.jar /path/to/jmc/dropins/
```

Run JMC and create a rjmx connection to `service:jmx:remote+http://localhost:9990`. Mind the credentials. This should work on both OpenJDK 8 and OpenJDK 11. Use the flag `-clean` to make sure the OSGi environment is clean. Use `rm -rf ~/.jmc` to clean the JMC environment

```
$ rm -rf ~/.jmc
$ jmc -clean -vm /path/to/jdk/bin
```

## Other

For verification, the expected result of the `META-INF/MANIFEST.MF` file in the jboss-client jar should be similar to:

```
Manifest-Version: 1.0
Implementation-Title: WildFly: EJB and JMS client combined jar
Implementation-Version: 20.0.0.Beta1
Java-Version: 1.8.0_252
Built-By: jperkins
Scm-Connection: scm:git:git@github.com:wildfly/wildfly.git/client/wildfl
 y-client-all
Specification-Vendor: JBoss by Red Hat
Os-Arch: amd64
Specification-Title: WildFly: EJB and JMS client combined jar
Implementation-Vendor-Id: org.wildfly
JBossAS-Release-Version: 20.0.0.Beta1
Java-Vendor: Oracle Corporation
Os-Name: Linux
Scm-Url: https://github.com/wildfly/wildfly
Implementation-Vendor: JBoss by Red Hat
Os-Version: 5.6.12-300.fc32.x86_64
Scm-Revision: 3edb954c2bda5954662d3ecfabcc1dcdcccff4d0
Multi-Release: true
JBossAS-Release-Codename: N/A
Created-By: Apache Maven 3.6.3
Build-Jdk: 1.8.0_252
Specification-Version: 20.0
Implementation-URL: http://www.jboss.org/wildfly-parent/client/wildfly-c
 lient-all
Bundle-ManifestVersion: 2 
Bundle-SymbolicName: org.jboss.client
Bundle-Version: 1.0
Bundle-Name: Test Extension
Fragment-Host: org.openjdk.jmc.rjmx
Export-Package: *
Automatic-Module-Name: org.jboss.client
```

Also, I have a local patch to JMC to stop passing empty string credentials that I used when testing with my own build of JMC. I should *not* affect the test but if you also are running a local build, here it is (copy into .diff file and apply via vcs):

```
diff --git a/application/org.openjdk.jmc.rjmx/src/main/java/org/openjdk/jmc/rjmx/internal/JMXConnectionDescriptor.java b/application/org.openjdk.jmc.rjmx/src/main/java/org/openjdk/jmc/rjmx/internal/JMXConnectionDescriptor.java
index 1c3c9b7..62e2bdb 100644
--- a/application/org.openjdk.jmc.rjmx/src/main/java/org/openjdk/jmc/rjmx/internal/JMXConnectionDescriptor.java
+++ b/application/org.openjdk.jmc.rjmx/src/main/java/org/openjdk/jmc/rjmx/internal/JMXConnectionDescriptor.java
@@ -91,27 +91,30 @@ public final class JMXConnectionDescriptor implements IConnectionDescriptor {
 	public Map<String, Object> getEnvironment() {
 		Map<String, Object> env = new HashMap<>();
 		try {
-			String user = ""; //$NON-NLS-1$
-			String pwd = ""; //$NON-NLS-1$
 			if (credentials != null) {
+				String user = ""; //$NON-NLS-1$
+				String pwd = ""; //$NON-NLS-1$
 				if (credentials.getUsername() != null) {
 					user = credentials.getUsername();
 				}
 				if (credentials.getPassword() != null) {
 					pwd = credentials.getPassword();
 				}
-			}
-			String[] creArray = new String[2];
-			creArray[0] = user;
-			creArray[1] = pwd;
-			env.put(JMXConnector.CREDENTIALS, creArray);
 
-			// This is here for properly supporting t3 authentication...
-			env.put(Context.SECURITY_PRINCIPAL, user);
-			env.put(Context.SECURITY_CREDENTIALS, pwd);
+				String[] creArray = new String[2];
+				creArray[0] = user;
+				creArray[1] = pwd;
+				if (!user.equals("")) {
+					env.put(JMXConnector.CREDENTIALS, creArray);
+				}
+				// This is here for properly supporting t3 authentication...
+				env.put(Context.SECURITY_PRINCIPAL, user);
+				env.put(Context.SECURITY_CREDENTIALS, pwd);
+			}
 		} catch (SecurityException e) {
 			throw new RuntimeException(e);
 		}
+
 		return env;
 	}
 
```