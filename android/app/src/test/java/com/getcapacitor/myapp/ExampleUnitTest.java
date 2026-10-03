// Naglalaman ito ng sample JVM unit test para sa Android module.
package com.getcapacitor.myapp;

import static org.junit.Assert.*;

import org.junit.Test;

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
public class ExampleUnitTest {

    @Test
    // Walang input; chine-check ng unit test na tama ang simpleng addition result.
    public void addition_isCorrect() throws Exception {
        assertEquals(4, 2 + 2);
    }
}
