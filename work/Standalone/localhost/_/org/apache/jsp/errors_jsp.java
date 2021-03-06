/*
 * Generated by the Jasper component of Apache Tomcat
 * Version: Apache Tomcat/7.0.47
 * Generated at: 2015-04-29 12:05:28 UTC
 * Note: The last modified time of this file was set to
 *       the last modified time of the source file after
 *       generation to assist with modification tracking.
 */
package org.apache.jsp;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;
import com.atlassian.config.ConfigurationException;
import com.atlassian.confluence.core.ConfluenceSidManager;
import com.atlassian.johnson.JohnsonEventContainer;
import com.atlassian.johnson.event.Event;
import com.atlassian.spring.container.ContainerManager;
import java.util.Collection;
import java.util.Iterator;

public final class errors_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent {

  private static final javax.servlet.jsp.JspFactory _jspxFactory =
          javax.servlet.jsp.JspFactory.getDefaultFactory();

  private static java.util.Map<java.lang.String,java.lang.Long> _jspx_dependants;

  private javax.el.ExpressionFactory _el_expressionfactory;
  private org.apache.tomcat.InstanceManager _jsp_instancemanager;

  public java.util.Map<java.lang.String,java.lang.Long> getDependants() {
    return _jspx_dependants;
  }

  public void _jspInit() {
    _el_expressionfactory = _jspxFactory.getJspApplicationContext(getServletConfig().getServletContext()).getExpressionFactory();
    _jsp_instancemanager = org.apache.jasper.runtime.InstanceManagerFactory.getInstanceManager(getServletConfig());
  }

  public void _jspDestroy() {
  }

  public void _jspService(final javax.servlet.http.HttpServletRequest request, final javax.servlet.http.HttpServletResponse response)
        throws java.io.IOException, javax.servlet.ServletException {

    final javax.servlet.jsp.PageContext pageContext;
    javax.servlet.http.HttpSession session = null;
    final javax.servlet.ServletContext application;
    final javax.servlet.ServletConfig config;
    javax.servlet.jsp.JspWriter out = null;
    final java.lang.Object page = this;
    javax.servlet.jsp.JspWriter _jspx_out = null;
    javax.servlet.jsp.PageContext _jspx_page_context = null;


    try {
      response.setContentType("text/html");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;

      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("\n");
      out.write("<html>\n");
      out.write("<head>\n");
      out.write("    <title>Errors</title>\n");
      out.write("    <style type=\"text/css\">\n");
      out.write("        body {\n");
      out.write("            font-family: Arial, Helvetica, FreeSans, sans-serif;\n");
      out.write("        }\n");
      out.write("\n");
      out.write("        h1 {\n");
      out.write("            color: #003366; \n");
      out.write("        }\n");
      out.write("\n");
      out.write("        table.error {\n");
      out.write("            width: 100%;\n");
      out.write("            border: 1px solid #ccc;\n");
      out.write("            border-collapse: collapse;\n");
      out.write("        }\n");
      out.write("\n");
      out.write("        table.error td, table.error th {\n");
      out.write("            padding: 10px;\n");
      out.write("            border: 1px solid #ccc;\n");
      out.write("            vertical-align: top;\n");
      out.write("            line-height: 16pt; \n");
      out.write("        }\n");
      out.write("\n");
      out.write("        table.error th {\n");
      out.write("            text-align: left;\n");
      out.write("        }\n");
      out.write("\n");
      out.write("        table.error tr.header {\n");
      out.write("            background-color: #f0f0f0;\n");
      out.write("        }\n");
      out.write("    </style>\n");
      out.write("</head>\n");
      out.write("<body>\n");
      out.write("\n");
      out.write("<h1><img src=\"");
      out.print( request.getContextPath() );
      out.write("/images/logo/confluence_48_white.png\" alt=\"Confluence Logo\" align=\"absmiddle\"> Confluence</h1>\n");
      out.write("\n");
      out.write("        ");

                String sid = null;
                if (ContainerManager.isContainerSetup())
                {
                    ConfluenceSidManager sidManager = (ConfluenceSidManager) ContainerManager.getComponent("sidManager");
                    try
                    {
                        sid = sidManager.getSid();
                    }
                    catch (ConfigurationException e)
                    {
                        // ignore, we just don't want this to bomb out this page 
                    }
                }

                JohnsonEventContainer appEventContainer = JohnsonEventContainer.get(pageContext.getServletContext());
                //if there are Events outstanding then set the HTTP return code to 500 Internal Server Error
                if (appEventContainer != null && appEventContainer.hasEvents())
                {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.flushBuffer(); // needed otherwise an exception is thrown
                }
                //if there are Events outstanding then display them in a table
                if (appEventContainer != null && appEventContainer.hasEvents())
                {
            
      out.write("\n");
      out.write("                        <content tag=\"headsection\">\n");
      out.write("                            <meta http-equiv=\"Refresh\" content=\"60;\"/>\n");
      out.write("                        </content>\n");
      out.write("                        \n");
      out.write("                    <p>You cannot access Confluence at present. Look at the table below to identify the reasons.</p>\n");
      out.write("\n");
      out.write("                    <table class=\"error\">\n");
      out.write("\n");
      out.write("                        <tr class=\"header\">\n");
      out.write("                            <th>Type</th>\n");
      out.write("                            <th width=40%>Description</th>\n");
      out.write("                            <th width=40%>Exception</th>\n");
      out.write("                            <th>Level</th>\n");
      out.write("                            <th nowrap>Time</th>\n");
      out.write("                        </tr>\n");
      out.write("\n");
      out.write("                        ");

                            Collection events  = appEventContainer.getEvents();
                            for (Iterator iterator = events.iterator(); iterator.hasNext();)
                            {
                                Event event = (Event) iterator.next();

                                
      out.write("\n");
      out.write("                                <tr bgcolor=\"#fffff0\">\n");
      out.write("                                    <td nowrap>");
      out.print(event.getKey() == null ? "" : event.getKey().getType());
      out.write("</td>\n");
      out.write("                                    ");
      out.write("\n");
      out.write("                                    <td>");
      out.print(event.getDesc().replaceAll("\\$CONTEXT",request.getContextPath()));
      out.write("<br/><br/>");
      out.print( (sid == null ? " No server id found." : " Your server id is: <strong>" + sid + "</strong>") );
      out.write("</td>\n");
      out.write("                                    <td><pre>");
      out.print(event.getException() == null ? "" : event.getException());
      out.write("</pre></td>\n");
      out.write("                                    <td nowrap>");
      out.print(event.getLevel() == null ? "" : event.getLevel().getLevel());
      out.write(" </td>\n");
      out.write("                                    <td nowrap>");
      out.print(event.getDate());
      out.write("</td>\n");
      out.write("                                </tr>\n");
      out.write("                                ");

                                }

                            
      out.write("\n");
      out.write("                    </table>\n");
      out.write("\n");
      out.write("                    <p>This page will automatically update every 60 seconds.</p>\n");
      out.write("\n");
      out.write("                ");
 } else { 
      out.write("\n");
      out.write("                    <p>This instance of Confluence is now ready to use again. Go to the <a href=\"");
      out.print( request.getContextPath() + "/" );
      out.write("\">Homepage</a>.</p>\n");
      out.write("                 ");
 } 
      out.write("\n");
      out.write("    </body>\n");
      out.write("</html>\n");
    } catch (java.lang.Throwable t) {
      if (!(t instanceof javax.servlet.jsp.SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          try { out.clearBuffer(); } catch (java.io.IOException e) {}
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
        else throw new ServletException(t);
      }
    } finally {
      _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
