"""
Advanced Mathematical Reasoning & Symbolic Computation Engine for JARVIS.
Handles symbolic calculus (derivatives, integrals), algebraic equations,
arithmetic, percentages, and scientific formulas via SymPy.
"""

import re
import logging
import sympy as sp
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

log = logging.getLogger("signal")

TRANSFORMS = standard_transformations + (implicit_multiplication_application, convert_xor)


def _normalize_math_text(text: str) -> str:
    """Preprocess natural language math phrasing into formal expressions."""
    t = text.strip()
    # Normalize common spoken math words
    t = re.sub(r"\bmultiplied by\b", "*", t, flags=re.I)
    t = re.sub(r"\btimes\b", "*", t, flags=re.I)
    t = re.sub(r"\bdivided by\b", "/", t, flags=re.I)
    t = re.sub(r"\bover\b", "/", t, flags=re.I)
    t = re.sub(r"\bplus\b", "+", t, flags=re.I)
    t = re.sub(r"\bminus\b", "-", t, flags=re.I)
    t = re.sub(r"\bto the power of\b", "**", t, flags=re.I)
    t = re.sub(r"\braised to\b", "**", t, flags=re.I)
    t = re.sub(r"\bsquared\b", "**2", t, flags=re.I)
    t = re.sub(r"\bcubed\b", "**3", t, flags=re.I)
    t = re.sub(r"\bsquare root of\s+([a-zA-Z0-9_]+)", r"sqrt(\1)", t, flags=re.I)
    t = re.sub(r"\bpercent of\b", "% of", t, flags=re.I)
    return t


def solve_math(query: str) -> dict:
    """
    Evaluates or solves mathematical queries.
    Returns spoken dialogue, display text, and structured holographic MathCard data.
    """
    raw_query = query.strip()
    norm = _normalize_math_text(raw_query)

    # Clean leading trigger phrases
    cleaned = re.sub(
        r"^(?:please\s+)?(?:can you\s+)?(?:solve|calculate|evaluate|compute|what(?:'s| is))\s+(?:the\s+)?",
        "",
        norm,
        flags=re.I,
    ).strip()

    # 1. Percentage calculations: "P% of X" or "P percent of X"
    pct_match = re.search(r"([\d.]+)\s*%\s*of\s*([\d,.]+)", cleaned, re.I)
    if pct_match:
        try:
            p_val = float(pct_match.group(1))
            x_val = float(pct_match.group(2).replace(",", ""))
            res = (p_val / 100.0) * x_val
            # Format integer if whole
            res_str = f"{int(res):,}" if res.is_integer() else f"{res:,.4f}".rstrip("0").rstrip(".")
            speech = f"{pct_match.group(1)} percent of {pct_match.group(2)} is {res_str}, Sir."
            text_disp = f"{pct_match.group(1)}% of {pct_match.group(2)} = {res_str}"
            return {
                "speech": speech,
                "text": text_disp,
                "card": {
                    "type": "math",
                    "data": {
                        "category": "PERCENTAGE",
                        "query": raw_query,
                        "expression": f"{p_val}% \\times {x_val:g}",
                        "result": res_str,
                        "latex": f"{p_val}\\% \\times {x_val:g} = {res_str}",
                        "steps": [
                            f"Convert percentage to decimal: {p_val} / 100 = {p_val / 100.0}",
                            f"Multiply by total: {p_val / 100.0} * {x_val:g} = {res_str}",
                        ],
                    },
                },
            }
        except Exception as e:
            log.warning("Percentage calculation failed: %s", e)

    # 2. Derivative calculations: "derivative of <expr>" or "d/dx <expr>"
    deriv_match = re.search(r"(?:derivative\s+of|differentiate|d/dx\s+of|d/dx)\s+(.+)", cleaned, re.I)
    if deriv_match:
        expr_str = deriv_match.group(1).strip()
        try:
            x = sp.Symbol("x")
            sym_expr = parse_expr(expr_str, transformations=TRANSFORMS)
            diff_res = sp.diff(sym_expr, x)
            latex_expr = sp.latex(sym_expr)
            latex_res = sp.latex(diff_res)
            res_str = str(diff_res)
            speech = f"The derivative of {expr_str} with respect to x is {res_str}, Sir."
            text_disp = f"d/dx [{expr_str}] = {res_str}"
            return {
                "speech": speech,
                "text": text_disp,
                "card": {
                    "type": "math",
                    "data": {
                        "category": "CALCULUS (DERIVATIVE)",
                        "query": raw_query,
                        "expression": f"d/dx [{expr_str}]",
                        "result": res_str,
                        "latex": f"\\frac{{d}}{{dx}}\\left({latex_expr}\\right) = {latex_res}",
                        "steps": [
                            f"Original function f(x) = {expr_str}",
                            f"Applied symbolic differentiation with respect to x",
                            f"f'(x) = {res_str}",
                        ],
                    },
                },
            }
        except Exception as e:
            log.warning("Symbolic differentiation failed on %r: %s", expr_str, e)

    # 3. Integral calculations: "integral of <expr>" or "integrate <expr>"
    int_match = re.search(r"(?:integral\s+of|integrate)\s+(.+)", cleaned, re.I)
    if int_match:
        expr_str = int_match.group(1).strip()
        try:
            x = sp.Symbol("x")
            sym_expr = parse_expr(expr_str, transformations=TRANSFORMS)
            int_res = sp.integrate(sym_expr, x)
            latex_expr = sp.latex(sym_expr)
            latex_res = sp.latex(int_res)
            res_str = f"{int_res} + C"
            speech = f"The integral of {expr_str} with respect to x is {res_str}, Sir."
            text_disp = f"∫ ({expr_str}) dx = {res_str}"
            return {
                "speech": speech,
                "text": text_disp,
                "card": {
                    "type": "math",
                    "data": {
                        "category": "CALCULUS (INTEGRATION)",
                        "query": raw_query,
                        "expression": f"∫ ({expr_str}) dx",
                        "result": res_str,
                        "latex": f"\\int \\left({latex_expr}\\right) dx = {latex_res} + C",
                        "steps": [
                            f"Integrand f(x) = {expr_str}",
                            f"Evaluated antiderivative symbolically",
                            f"F(x) = {res_str}",
                        ],
                    },
                },
            }
        except Exception as e:
            log.warning("Symbolic integration failed on %r: %s", expr_str, e)

    # 4. Algebraic Equation Solving: e.g. "solve x^2 - 5x + 6 = 0"
    if "=" in cleaned:
        try:
            lhs_str, rhs_str = cleaned.split("=", 1)
            x = sp.Symbol("x")
            lhs = parse_expr(lhs_str.strip(), transformations=TRANSFORMS)
            rhs = parse_expr(rhs_str.strip(), transformations=TRANSFORMS)
            solutions = sp.solve(sp.Eq(lhs, rhs), x)
            sol_str = ", ".join(str(s) for s in solutions)
            speech = f"The solutions for {cleaned} are x equals {sol_str}, Sir."
            text_disp = f"Solutions for {cleaned}: x = {sol_str}"
            return {
                "speech": speech,
                "text": text_disp,
                "card": {
                    "type": "math",
                    "data": {
                        "category": "ALGEBRA",
                        "query": raw_query,
                        "expression": cleaned,
                        "result": f"x = {sol_str}",
                        "latex": f"{sp.latex(lhs)} = {sp.latex(rhs)} \\implies x \\in \\{{{sp.latex(solutions)}\\}}",
                        "steps": [
                            f"Formulated equation: {lhs_str.strip()} = {rhs_str.strip()}",
                            f"Derived roots for variable x",
                            f"Roots: {sol_str}",
                        ],
                    },
                },
            }
        except Exception as e:
            log.warning("Equation solving failed: %s", e)

    # 5. General Arithmetic & Formula Evaluation: e.g. "5000 * 1.07^4", "sqrt(144) + 25"
    try:
        sym_expr = parse_expr(cleaned, transformations=TRANSFORMS)
        evaluated = sym_expr.evalf()
        # Format if float
        if evaluated.is_number:
            val = float(evaluated)
            res_str = f"{int(val):,}" if val.is_integer() else f"{val:,.6f}".rstrip("0").rstrip(".")
        else:
            res_str = str(evaluated)

        speech = f"The result of {cleaned} is {res_str}, Sir."
        text_disp = f"{cleaned} = {res_str}"
        return {
            "speech": speech,
            "text": text_disp,
            "card": {
                "type": "math",
                "data": {
                    "category": "ARITHMETIC",
                    "query": raw_query,
                    "expression": cleaned,
                    "result": res_str,
                    "latex": f"{sp.latex(sym_expr)} = {res_str}",
                    "steps": [
                        f"Parsed mathematical expression: {cleaned}",
                        f"Computed exact numerical solution: {res_str}",
                    ],
                },
            },
        }
    except Exception as e:
        log.warning("General arithmetic evaluation failed on %r: %s", cleaned, e)

    # Fallback
    fallback_speech = f"I was unable to evaluate that mathematical formulation, Sir."
    return {
        "speech": fallback_speech,
        "text": fallback_speech,
        "card": None,
    }
